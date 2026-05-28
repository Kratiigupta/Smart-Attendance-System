'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import {
  HiOutlineCreditCard,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineArrowDownTray,
  HiOutlineCheckCircle,
  HiOutlineCheck,
} from 'react-icons/hi2';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { jsPDF } from 'jspdf';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface FeeItem {
  id: string;
  name: string;
  category: 'Academic' | 'Facilities' | 'Hostel' | 'Other';
  amount: number;
  status: 'Paid' | 'Unpaid';
  dueDate: string;
}

interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  method: string;
  date: string;
  receiptNo: string;
  status: 'Success' | 'Pending';
}

export default function StudentFees() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: ledger = [], isLoading: ledgerLoading } = useQuery<FeeItem[]>({
    queryKey: ['feesLedger'],
    queryFn: async () => {
      const res = await api.get('/fees/ledger');
      if (!res.success) throw new Error(res.message || 'Failed to fetch ledger');
      return (res.data || []).map((item: any) => ({
        id: item._id || item.id,
        name: item.name,
        category: item.category,
        amount: item.amount,
        status: item.status,
        dueDate: item.dueDate
      }));
    }
  });

  const { data: transactions = [], isLoading: txnsLoading } = useQuery<Transaction[]>({
    queryKey: ['feesTransactions'],
    queryFn: async () => {
      const res = await api.get('/fees/transactions');
      if (!res.success) throw new Error(res.message || 'Failed to fetch transactions');
      return (res.data || []).map((item: any) => ({
        id: item._id || item.id,
        transactionId: item.transactionId,
        amount: item.amount,
        method: item.method,
        date: item.date,
        receiptNo: item.receiptNo,
        status: item.status
      }));
    }
  });





  const payMutation = useMutation({
    mutationFn: async ({ method, amount }: { method: string; amount: number }) => {
      const res = await api.post('/fees/pay', { method, amount });
      if (!res.success) throw new Error(res.message || 'Failed to process payment');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feesLedger'] });
      queryClient.invalidateQueries({ queryKey: ['feesTransactions'] });
      showToast('Payment completed successfully!', 'success');
      setPaymentStep(3);
    },
    onError: (err: any) => {
      showToast(err.message || 'Payment failed', 'error');
    }
  });

  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const exportReceiptPDF = (txn: Transaction) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text(user?.collegeName || 'SmartEdu Campus', 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Affiliated to State Technical University', 105, 32, { align: 'center' });
    doc.text('E-Receipt for Academic Fees', 105, 37, { align: 'center' });
    
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 42, 195, 42);
    
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(`Transaction Ref: ${txn.transactionId}`, 15, 52);
    doc.text(`Receipt Number: ${txn.receiptNo}`, 195, 52, { align: 'right' });
    doc.text(`Student Name: ${user?.name || 'Abhishek Singh'}`, 15, 60);
    doc.text(`Roll Number: ${user?.studentData?.rollNumber || 'CSE-2022-05'}`, 195, 60, { align: 'right' });
    doc.text(`Payment Date: ${txn.date}`, 15, 68);
    doc.text(`Payment Method: ${txn.method}`, 195, 68, { align: 'right' });
    
    doc.line(15, 75, 195, 75);
    
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Fee Head Description', 15, 83);
    doc.text('Amount (INR)', 195, 83, { align: 'right' });
    
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Academic & Semester Fee Clearance', 15, 91);
    doc.text(`Rs. ${txn.amount.toLocaleString('en-IN')}`, 195, 91, { align: 'right' });
    
    doc.line(15, 98, 195, 98);
    
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Total Sum Paid:', 15, 106);
    doc.text(`Rs. ${txn.amount.toLocaleString('en-IN')}`, 195, 106, { align: 'right' });
    
    doc.line(15, 115, 195, 115);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(16, 185, 129);
    doc.text('DIGITALLY VERIFIED & COMPLETED TRANSACTION', 105, 123, { align: 'center' });
    
    doc.save(`Receipt_${txn.transactionId}.pdf`);
    showToast('Receipt downloaded successfully as PDF.', 'success');
  };
  
  // Payment Gateway States
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const isPaying = payMutation.isPending;

  const unpaidItems = ledger.filter((item) => item.status === 'Unpaid');
  const totalDue = unpaidItems.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = ledger.filter((item) => item.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);

  const handleOpenReceipt = (txn: Transaction) => {
    setSelectedTxn(txn);
    setIsReceiptModalOpen(true);
  };

  const handlePayNow = () => {
    setPaymentStep(1);
    setIsPayModalOpen(true);
  };

  const handleProceedPayment = () => {
    if (paymentStep === 1) {
      if (!paymentMethod) {
        showToast('Please select a payment method', 'warning');
        return;
      }
      setPaymentStep(2);
    } else if (paymentStep === 2) {
      payMutation.mutate({ method: paymentMethod, amount: totalDue });
    }
  };

  const ledgerColumns = [
    {
      header: 'Fee Head',
      accessor: (row: FeeItem) => (
        <div>
          <div className="text-xs font-bold text-text-primary">{row.name}</div>
          <div className="text-[9px] text-text-dim uppercase tracking-wider">{row.category}</div>
        </div>
      ),
    },
    {
      header: 'Due Date',
      accessor: (row: FeeItem) => (
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
          <HiOutlineCalendar className="w-3.5 h-3.5" />
          <span>{row.dueDate}</span>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (row: FeeItem) => (
        <span className="font-mono text-xs font-bold text-text-primary">
          ₹{row.amount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: FeeItem) => (
        <Badge variant={row.status === 'Paid' ? 'success' : 'warning'} size="xs">
          {row.status}
        </Badge>
      ),
    },
  ];

  const transactionColumns = [
    {
      header: 'Transaction ID',
      accessor: (row: Transaction) => (
        <div>
          <div className="text-xs font-bold text-text-primary">{row.transactionId}</div>
          <div className="text-[9px] text-text-dim">Receipt: {row.receiptNo}</div>
        </div>
      ),
    },
    {
      header: 'Date',
      accessor: 'date' as keyof Transaction,
    },
    {
      header: 'Method',
      accessor: 'method' as keyof Transaction,
    },
    {
      header: 'Amount',
      accessor: (row: Transaction) => (
        <span className="font-mono text-xs font-bold text-text-primary">
          ₹{row.amount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Transaction) => (
        <Badge variant="success" size="xs">
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: Transaction) => (
        <Button
          variant="outline"
          size="xs"
          icon={<HiOutlineDocumentText className="w-3.5 h-3.5" />}
          onClick={() => handleOpenReceipt(row)}
        >
          Receipt
        </Button>
      ),
    },
  ];

  if (ledgerLoading || txnsLoading) {
    return (
      <div className="space-y-6 py-12 text-center text-xs text-text-muted animate-pulse">
        🔄 Loading fee ledger & secure payment history...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">Fee Ledger</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Review fee structures, pending dues, download official receipts, and make secure payments.
          </p>
        </div>
        {totalDue > 0 && (
          <Button variant="primary" size="md" icon={<HiOutlineCreditCard className="w-4 h-4" />} onClick={handlePayNow}>
            Pay Outstanding Fees (₹{totalDue.toLocaleString('en-IN')})
          </Button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Paid"
          value={`₹${totalPaid.toLocaleString('en-IN')}`}
          icon={HiOutlineCheckCircle}
          color="success"
          subtitle="Paid this academic year"
        />
        <StatCard
          title="Outstanding Due"
          value={`₹${totalDue.toLocaleString('en-IN')}`}
          icon={HiOutlineCreditCard}
          color={totalDue > 0 ? 'warning' : 'primary'}
          subtitle="Awaiting clearance"
        />
        <StatCard
          title="Next Due Date"
          value={totalDue > 0 ? '15 June 2026' : 'No Pending Dues'}
          icon={HiOutlineCalendar}
          color="accent"
          subtitle="Standard semester window"
        />
      </div>

      {/* Ledger Table */}
      <Card title="Detailed Fee Ledger" subtitle="Itemized list of semester fees">
        <DataTable
          columns={ledgerColumns}
          data={ledger}
          emptyMessage="No ledger items found."
        />
      </Card>

      {/* Transaction History */}
      <Card title="Payment Transaction History" subtitle="Your secure payment receipt log">
        <DataTable
          columns={transactionColumns}
          data={transactions}
          emptyMessage="No transactions made yet."
        />
      </Card>

      {/* Branded Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Official Payment Receipt"
        size="md"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsReceiptModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" icon={<HiOutlineArrowDownTray className="w-4 h-4" />} onClick={() => selectedTxn && exportReceiptPDF(selectedTxn)}>
              Download PDF
            </Button>
          </div>
        }
      >
        {selectedTxn && (
          <div className="p-4 space-y-6 text-xs text-text-secondary">
            {/* College Header */}
            <div className="text-center space-y-1 pb-4 border-b border-b-border/20">
              <div className="text-lg font-heading font-black text-text-primary">{user?.collegeName || 'SmartEdu Campus'}</div>
              <div className="text-[10px] text-text-muted">Affiliated to State Technical University • {user?.collegeName ? `${user.collegeName} Campus` : 'Nawabganj, Unnao'}</div>
              <div className="text-[9px] text-text-dim">E-Receipt for Academic Fees</div>
            </div>

            {/* Receipt details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-text-dim block text-[9px] uppercase font-bold">Transaction Reference</span>
                <span className="text-text-primary font-bold">{selectedTxn.transactionId}</span>
              </div>
              <div className="text-right">
                <span className="text-text-dim block text-[9px] uppercase font-bold">Receipt Number</span>
                <span className="text-text-primary font-bold">{selectedTxn.receiptNo}</span>
              </div>
              <div>
                <span className="text-text-dim block text-[9px] uppercase font-bold">Student Name</span>
                <span className="text-text-primary font-bold">{user?.name || 'Abhishek Singh'}</span>
              </div>
              <div className="text-right">
                <span className="text-text-dim block text-[9px] uppercase font-bold">Roll Number</span>
                <span className="text-text-primary font-bold">{user?.studentData?.rollNumber || 'CSE-2022-05'}</span>
              </div>
              <div>
                <span className="text-text-dim block text-[9px] uppercase font-bold">Payment Date</span>
                <span className="text-text-primary font-bold font-mono">{selectedTxn.date}</span>
              </div>
              <div className="text-right">
                <span className="text-text-dim block text-[9px] uppercase font-bold">Payment Method</span>
                <span className="text-text-primary font-bold">{selectedTxn.method}</span>
              </div>
            </div>

            {/* Total Section */}
            <div className="p-4 rounded-xl bg-bg-secondary border border-border/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-text-muted uppercase font-bold">Total Amount Paid</span>
                <p className="text-[9px] text-text-dim mt-0.5">All applicable server charges inclusive</p>
              </div>
              <span className="text-lg font-mono font-black text-success-light">
                ₹{selectedTxn.amount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Verification Seal */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-success-light bg-success/8 border border-success/15 py-2.5 rounded-xl">
              <HiOutlineCheckCircle className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wider">Digitally Verified & Completed Transaction</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Pay Fees Payment Gateway Wizard */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => !isPaying && setIsPayModalOpen(false)}
        title="Secure Payment Gateway"
        size="md"
      >
        <div className="space-y-6 text-xs text-text-secondary">
          {/* Step Indicators */}
          <div className="flex items-center justify-between border-b border-border/20 pb-4">
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${paymentStep >= 1 ? 'bg-primary text-white' : 'bg-bg-hover text-text-dim'}`}>1</span>
              <span className="font-bold text-text-primary">Method</span>
            </div>
            <div className="w-10 h-0.5 bg-border/40" />
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${paymentStep >= 2 ? 'bg-primary text-white' : 'bg-bg-hover text-text-dim'}`}>2</span>
              <span className={`font-bold ${paymentStep >= 2 ? 'text-text-primary' : 'text-text-dim'}`}>Confirm</span>
            </div>
            <div className="w-10 h-0.5 bg-border/40" />
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${paymentStep >= 3 ? 'bg-primary text-white' : 'bg-bg-hover text-text-dim'}`}>3</span>
              <span className={`font-bold ${paymentStep >= 3 ? 'text-text-primary' : 'text-text-dim'}`}>Status</span>
            </div>
          </div>

          {/* STEP 1: Select Payment Method */}
          {paymentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-text-primary">Choose a Secure Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'upi', name: 'UPI (GPay / PhonePe / BHIM)', desc: 'Instant transfer via virtual address' },
                  { id: 'netbanking', name: 'Net Banking (All Indian Banks)', desc: 'Redirect to secure banking page' },
                  { id: 'card', name: 'Credit / Debit Card', desc: 'Visa, MasterCard, RuPay supported' },
                ].map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.name)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      paymentMethod === method.name
                        ? 'border-primary bg-primary/8 text-primary-light shadow-md shadow-primary/5'
                        : 'border-border/40 hover:bg-bg-hover text-text-secondary'
                    }`}
                  >
                    <div className="font-bold text-xs">{method.name}</div>
                    <p className="text-[10px] text-text-dim mt-0.5">{method.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Review and Authorize */}
          {paymentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-text-primary">Confirm Your Payment Details</h3>
              <div className="p-4 rounded-xl bg-bg-secondary border border-border/15 space-y-2.5">
                <div className="flex justify-between py-0.5">
                  <span className="text-text-muted">Payee</span>
                  <span className="font-bold text-text-primary">SmartEdu Campus</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-text-muted">Payment Category</span>
                  <span className="font-bold text-text-primary">Academic & Hostel Fees</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-text-muted">Selected Method</span>
                  <span className="font-bold text-text-primary">{paymentMethod}</span>
                </div>
                <div className="border-t border-border/15 pt-2 flex justify-between">
                  <span className="text-text-muted font-bold">Total Payable</span>
                  <span className="text-sm font-mono font-black text-text-primary">₹{totalDue.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <p className="text-[10px] text-text-dim leading-relaxed">
                By proceeding, you will be redirected to the secure sandbox payment processor. Do not close this browser tab or press the back button.
              </p>
            </div>
          )}

          {/* STEP 3: Payment Success Screen */}
          {paymentStep === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-success/15 text-success rounded-full flex items-center justify-center mx-auto shadow-lg shadow-success/10">
                <HiOutlineCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-heading font-black text-text-primary">Payment Successful!</h3>
                <p className="text-xs text-text-muted">Your payment of ₹{totalDue.toLocaleString('en-IN')} has been credited.</p>
              </div>
              <div className="p-3 bg-bg-secondary border border-border/15 rounded-xl inline-block font-mono text-[10px] text-text-secondary">
                Reference: TXN{Math.floor(10000000 + Math.random() * 90000000)}
              </div>
              <p className="text-[10px] text-text-dim">Your fee ledger has been updated and a confirmation email has been sent.</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 border-t border-border/20 pt-4">
            {paymentStep < 3 ? (
              <>
                <Button variant="outline" size="sm" disabled={isPaying} onClick={() => setIsPayModalOpen(false)}>
                  Cancel
                </Button>
                {paymentStep === 2 && (
                  <Button variant="ghost" size="sm" disabled={isPaying} onClick={() => setPaymentStep(1)}>
                    Back
                  </Button>
                )}
                <Button variant="primary" size="sm" loading={isPaying} onClick={handleProceedPayment}>
                  {paymentStep === 1 ? 'Proceed' : 'Pay Securely'}
                </Button>
              </>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setIsPayModalOpen(false)}>
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

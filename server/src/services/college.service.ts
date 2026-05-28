import { College } from '../models/College.js';
import { Student, Faculty } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Course } from '../models/Course.js';

export interface CollegeSettingsUpdate {
  attendanceThreshold?: number;
  timezone?: string;
  workingDays?: string[];
}

export interface CollegeProfileUpdate {
  name?: string;
  domain?: string;
  address?: {
    city: string;
    state: string;
    country: string;
  };
}

export const getDashboardStatsData = async (collegeId: string) => {
  const [studentCount, facultyCount, departmentCount, courseCount] = await Promise.all([
    Student.countDocuments({ collegeId, role: 'student', isActive: true }),
    Faculty.countDocuments({ collegeId, role: { $in: ['faculty', 'hod'] }, isActive: true }),
    Department.countDocuments({ collegeId }),
    Course.countDocuments({ collegeId })
  ]);

  // Let's get department breakdown for visual graphs
  const depts = await Department.find({ collegeId }).select('name code');
  const deptStats = await Promise.all(depts.map(async (dept) => {
    const sCount = await Student.countDocuments({ collegeId, departmentId: dept._id, role: 'student', isActive: true });
    const fCount = await Faculty.countDocuments({ collegeId, departmentId: dept._id, role: { $in: ['faculty', 'hod'] }, isActive: true });
    return {
      name: dept.name,
      code: dept.code,
      students: sCount,
      faculty: fCount
    };
  }));

  return {
    totalStudents: studentCount,
    totalFaculty: facultyCount,
    totalDepartments: departmentCount,
    totalCourses: courseCount,
    departmentBreakdown: deptStats
  };
};

export const getCollegeProfileData = async (collegeId: string) => {
  const college = await College.findById(collegeId);
  if (!college) {
    throw { status: 404, message: 'College not found.' };
  }
  return college;
};

export const updateCollegeSettingsData = async (collegeId: string, updateData: CollegeSettingsUpdate) => {
  const college = await College.findById(collegeId);
  if (!college) {
    throw { status: 404, message: 'College not found.' };
  }

  if (updateData.attendanceThreshold !== undefined) {
    college.settings.attendanceThreshold = updateData.attendanceThreshold;
  }
  if (updateData.timezone !== undefined) {
    college.settings.timezone = updateData.timezone;
  }
  if (updateData.workingDays !== undefined) {
    college.settings.workingDays = updateData.workingDays;
  }

  await college.save();
  return college;
};

export const updateCollegeProfileData = async (collegeId: string, updateData: CollegeProfileUpdate) => {
  const college = await College.findByIdAndUpdate(
    collegeId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!college) {
    throw { status: 404, message: 'College not found.' };
  }

  return college;
};

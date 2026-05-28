import bcrypt from 'bcryptjs';
import { User, Student, Faculty } from '../models/User.js';

export interface InviteUserInput {
  name: string;
  email: string;
  role: 'college_admin' | 'hod' | 'faculty' | 'student';
  phone?: string;
  tempPassword: string;
  rollNumber?: string;
  semester?: number;
  employeeId?: string;
  designation?: string;
  departmentId?: string;
}

export interface UsersFilter {
  page?: number;
  limit?: number;
  role?: string;
  departmentId?: string;
  isActive?: string;
  search?: string;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  departmentId?: string;
  semester?: number;
  rollNumber?: string;
  employeeId?: string;
  designation?: string;
  maxHoursPerWeek?: number;
  specializations?: string[];
}

export const inviteUsersData = async (collegeId: string, usersToCreate: InviteUserInput[], isBulk: boolean) => {
  const createdUsers = [];

  for (const userData of usersToCreate) {
    // Check duplicate email in same college
    const duplicate = await User.findOne({ collegeId, email: userData.email.toLowerCase() });
    if (duplicate) {
      if (!isBulk) {
        throw { status: 400, message: `Email ${userData.email} is already in use by this college.` };
      }
      continue; // skip duplicate in bulk
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.tempPassword, 12);

    let newUser;
    const baseFields = {
      collegeId,
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash,
      role: userData.role,
      phone: userData.phone,
      isActive: true
    };

    if (userData.role === 'student') {
      newUser = new Student({
        ...baseFields,
        rollNumber: userData.rollNumber,
        departmentId: userData.departmentId,
        semester: userData.semester || 1,
        enrolledCourses: []
      });
    } else if (userData.role === 'faculty' || userData.role === 'hod') {
      newUser = new Faculty({
        ...baseFields,
        employeeId: userData.employeeId,
        departmentId: userData.departmentId,
        designation: userData.designation,
        assignedCourses: [],
        maxHoursPerWeek: 18,
        specializations: []
      });
    } else {
      newUser = new User(baseFields);
    }

    await newUser.save();
    createdUsers.push({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
  }

  return createdUsers;
};

export const getUsersFiltered = async (collegeId: string, filter: UsersFilter) => {
  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const skip = (page - 1) * limit;

  const role = filter.role;
  const departmentId = filter.departmentId;
  const isActive = filter.isActive;
  const search = filter.search;

  const filterQuery: any = { collegeId };

  if (role) filterQuery.role = role;
  if (isActive !== undefined) filterQuery.isActive = isActive === 'true';
  
  if (search) {
    filterQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  let usersQuery;
  if (role === 'student') {
    if (departmentId) filterQuery.departmentId = departmentId;
    usersQuery = Student.find(filterQuery);
  } else if (role === 'faculty' || role === 'hod') {
    if (departmentId) filterQuery.departmentId = departmentId;
    usersQuery = Faculty.find(filterQuery);
  } else {
    usersQuery = User.find(filterQuery);
  }

  const [users, total] = await Promise.all([
    usersQuery
      .populate('departmentId', 'name code')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filterQuery)
  ]);

  const cleanedUsers = users.map((u: any) => {
    const { passwordHash, ...rest } = u;
    return { id: u._id, ...rest };
  });

  return {
    users: cleanedUsers,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

export const getUserDetails = async (collegeId: string, id: string) => {
  const user = await User.findOne({ _id: id, collegeId });
  if (!user) {
    throw { status: 404, message: 'User not found.' };
  }

  let detailData: any = user.toObject();
  delete detailData.passwordHash;

  if (user.role === 'student') {
    const student = await Student.findOne({ _id: id, collegeId }).populate('departmentId').populate('enrolledCourses');
    detailData = student?.toObject();
    if (detailData) delete detailData.passwordHash;
  } else if (user.role === 'faculty' || user.role === 'hod') {
    const faculty = await Faculty.findOne({ _id: id, collegeId }).populate('departmentId').populate('assignedCourses');
    detailData = faculty?.toObject();
    if (detailData) delete detailData.passwordHash;
  }

  if (detailData) {
    detailData.id = detailData._id;
  }

  return detailData;
};

export const updateUserData = async (collegeId: string, id: string, updateBody: UpdateUserInput) => {
  const user = await User.findOne({ _id: id, collegeId });
  if (!user) {
    throw { status: 404, message: 'User not found.' };
  }

  const baseFields: any = {};
  if (updateBody.name !== undefined) baseFields.name = updateBody.name;
  if (updateBody.phone !== undefined) baseFields.phone = updateBody.phone;
  if (updateBody.avatar !== undefined) baseFields.avatar = updateBody.avatar;
  if (updateBody.isActive !== undefined) baseFields.isActive = updateBody.isActive;

  let updatedUser;
  if (user.role === 'student') {
    const studentFields: any = { ...baseFields };
    if (updateBody.departmentId !== undefined) studentFields.departmentId = updateBody.departmentId;
    if (updateBody.semester !== undefined) studentFields.semester = updateBody.semester;
    if (updateBody.rollNumber !== undefined) studentFields.rollNumber = updateBody.rollNumber;
    
    updatedUser = await Student.findOneAndUpdate(
      { _id: id, collegeId },
      { $set: studentFields },
      { new: true, runValidators: true }
    );
  } else if (user.role === 'faculty' || user.role === 'hod') {
    const facultyFields: any = { ...baseFields };
    if (updateBody.departmentId !== undefined) facultyFields.departmentId = updateBody.departmentId;
    if (updateBody.employeeId !== undefined) facultyFields.employeeId = updateBody.employeeId;
    if (updateBody.designation !== undefined) facultyFields.designation = updateBody.designation;
    if (updateBody.maxHoursPerWeek !== undefined) facultyFields.maxHoursPerWeek = updateBody.maxHoursPerWeek;
    if (updateBody.specializations !== undefined) facultyFields.specializations = updateBody.specializations;

    updatedUser = await Faculty.findOneAndUpdate(
      { _id: id, collegeId },
      { $set: facultyFields },
      { new: true, runValidators: true }
    );
  } else {
    updatedUser = await User.findOneAndUpdate(
      { _id: id, collegeId },
      { $set: baseFields },
      { new: true, runValidators: true }
    );
  }

  if (!updatedUser) {
    throw { status: 404, message: 'Failed to update user.' };
  }

  const cleanResult = updatedUser.toObject() as any;
  delete cleanResult.passwordHash;
  cleanResult.id = cleanResult._id;

  return cleanResult;
};

export const deleteUserData = async (collegeId: string, id: string) => {
  const user = await User.findOneAndUpdate(
    { _id: id, collegeId },
    { $set: { isActive: false } },
    { new: true }
  );

  if (!user) {
    throw { status: 404, message: 'User not found.' };
  }

  return user;
};

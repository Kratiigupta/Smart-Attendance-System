import { Course } from '../models/Course.js';
import { Department } from '../models/Department.js';

export interface CourseInput {
  departmentId: string;
  code: string;
  title: string;
  credits: number;
  type: 'DSC' | 'Minor' | 'MDC' | 'AEC' | 'SEC' | 'VAC' | 'Research' | 'Internship';
  ltp: {
    lecture: number;
    tutorial: number;
    practical: number;
  };
  semester: number;
  programmeType: 'FYUP' | 'ITEP' | 'PG';
  maxStudents?: number;
  isElective: boolean;
  prerequisites: string[];
}

export interface CoursesFilter {
  departmentId?: string;
  semester?: string;
  type?: string;
  programmeType?: string;
  search?: string;
}

export const createCourseData = async (collegeId: string, body: CourseInput) => {
  // Validate department
  const dept = await Department.findOne({ _id: body.departmentId, collegeId });
  if (!dept) {
    throw { status: 404, message: 'Department not found.' };
  }

  // Validate duplicate course code
  const duplicate = await Course.findOne({ collegeId, code: body.code });
  if (duplicate) {
    throw { status: 400, message: `Course code ${body.code} is already registered.` };
  }

  // Validate credit match (LTP sum check)
  const calculatedCredits = body.ltp.lecture + body.ltp.tutorial + Math.floor(body.ltp.practical / 2);
  console.log(`LTP: ${body.ltp.lecture}-${body.ltp.tutorial}-${body.ltp.practical} maps to ~${calculatedCredits} credits. Specified: ${body.credits}`);

  const course = new Course({
    collegeId,
    ...body
  });
  await course.save();
  return course;
};

export const getCoursesFiltered = async (collegeId: string, filter: CoursesFilter) => {
  const { departmentId, semester, type, programmeType, search } = filter;
  const filterQuery: any = { collegeId };

  if (departmentId) filterQuery.departmentId = departmentId;
  if (semester) filterQuery.semester = parseInt(semester, 10);
  if (type) filterQuery.type = type;
  if (programmeType) filterQuery.programmeType = programmeType;

  if (search) {
    filterQuery.$or = [
      { title: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  return Course.find(filterQuery)
    .populate('departmentId', 'name code')
    .sort({ code: 1 });
};

export const getCourseDetails = async (collegeId: string, id: string) => {
  const course = await Course.findOne({ _id: id, collegeId })
    .populate('departmentId', 'name code')
    .populate('prerequisites', 'title code');

  if (!course) {
    throw { status: 404, message: 'Course not found.' };
  }

  return course;
};

export const updateCourseData = async (collegeId: string, id: string, body: CourseInput) => {
  const course = await Course.findOne({ _id: id, collegeId });
  if (!course) {
    throw { status: 404, message: 'Course not found.' };
  }

  // Check duplicate code if changed
  if (body.code !== course.code) {
    const duplicate = await Course.findOne({ collegeId, code: body.code });
    if (duplicate) {
      throw { status: 400, message: `Course code ${body.code} is already allocated to another course.` };
    }
  }

  const updated = await Course.findOneAndUpdate(
    { _id: id, collegeId },
    { $set: body },
    { new: true, runValidators: true }
  );

  return updated;
};

export const deleteCourseData = async (collegeId: string, id: string) => {
  const course = await Course.findOneAndDelete({ _id: id, collegeId });
  if (!course) {
    throw { status: 404, message: 'Course not found.' };
  }
  return course;
};

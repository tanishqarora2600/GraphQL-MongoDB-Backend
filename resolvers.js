import { User } from "./models/user";
import { College } from "./models/colleges";
import { University } from "./models/university";
import { Course } from "./models/courses";
import { Branch } from "./models/branches";
const ObjectId = mongoose.Types.ObjectId;
import mongoose, { models } from "mongoose";
import { AuthenticationError, toApolloError } from "apollo-server-express";

export const resolvers = {
  Query: {
    getUserInfo: async (parent, { userId }, context, info) => {
      if (!context.req.isAuth) {
        throw new AuthenticationError("You are not authenticated");
      }
      const searchedUser = await User.findOne({
        userId: userId,
      }).exec();
      if (!searchedUser) {
        throw new Error("User does not exist ");
      }

      return searchedUser;
    },
    getUniversities: async (_, { pageNumber, limit }, context, info) => {
      if (!context.req.isAuth) {
        throw new AuthenticationError("You are not authenticated");
      }
      let page = Math.max(0, pageNumber);
      let totalPages = Math.ceil((await University.countDocuments({})) / limit);
      const totaluniversities = await University.find({})
        .collation({
          locale: "en",
          strength: 1,
        })
        .sort({
          universityName: 1,
        })
        .limit(limit)
        .skip(limit * page);
      console.log(totaluniversities);
      return {
        University: totaluniversities,
        currentPageNumber: pageNumber,
        totalPages: totalPages,
      };
    },

    getColleges: async (
      _,
      { pageNumber, limit, universityId },
      context,
      info
    ) => {
      if (!context.req.isAuth) {
        throw new AuthenticationError("You are not authenticated");
      }
      console.log(await University.find({}));

      let page = Math.max(0, pageNumber);

      let totalPages = Math.ceil(1);

      const totalColleges = await University.aggregate([
        {
          $match: {
            _id: ObjectId(universityId),
          },
        },
        {
          $unwind: "$college",
        },

        {
          $sort: {
            "college.collegeName": 1,
          },
        },
        {
          $skip: limit * page,
        },
        {
          $limit: limit,
        },
        {
          $group: {
            _id: "$id",
            college: {
              $push: "$college",
            },
          },
        },
        {
          $project: {
            college: 1,
            _id: 0,
          },
        },
      ]).collation({
        locale: "en",
        strength: 1,
      });
      //console.log( {...totalColleges[0], currentPageNumber: pageNumber,totalPages:totalPages});
      return {
        ...totalColleges[0],
        currentPageNumber: pageNumber,
        totalPages: totalPages,
      };
    },
    getCourses: async (_, { pageNumber, limit, collegeId }, context, info) => {
      if (!context.req.isAuth) {
        throw new AuthenticationError("You are not authenticated");
      }

      if (typeof collegeId !== "undefined" && collegeId) {
        let page = Math.max(0, pageNumber);
        let totalPages = Math.ceil((await Course.countDocuments({})) / limit);

        const totalCourses = await College.aggregate([
          {
            $match: {
              _id: ObjectId(collegeId),
            },
          },
          {
            $unwind: "$courses",
          },

          {
            $sort: {
              "courses.courseName": 1,
            },
          },
          {
            $skip: limit * page,
          },
          {
            $limit: limit,
          },
          {
            $group: {
              _id: "$id",
              courses: {
                $push: "$courses",
              },
            },
          },
          {
            $project: {
              courses: 1,
              _id: 0,
            },
          },
        ]).collation({
          locale: "en",
          strength: 1,
        });
        console.log({
          ...totalCourses[0],
        });
        return {
          ...totalCourses[0],
          currentPageNumber: pageNumber,
          totalPages: totalPages,
        };
      } else {
        let page = Math.max(0, pageNumber);
        let totalPages = Math.ceil((await Course.countDocuments({})) / limit);
        const totalCourses = await Course.find({})
          .collation({
            locale: "en",
            strength: 1,
          })
          .sort({
            courseName: 1,
          })
          .limit(limit)
          .skip(limit * page);
        return {
          Course: totalCourses,
          currentPageNumber: pageNumber,
          totalPages: totalPages,
        };
      }
    },
    getBranches: async (
      _,
      { pageNumber, limit, collegeId, courseId },
      context,
      info
    ) => {
      if (typeof collegeId !== "undefined" && collegeId) {
        let page = Math.max(0, pageNumber);

        const totalBranches = await College.aggregate([
          {
            $match: {
              _id: ObjectId(collegeId),
            },
          },
          {
            $project: {
              courses: 1,
              _id: 0,
            },
          },
          {
            $unwind: "$courses",
          },
          {
            $unwind: "$courses.branches",
          },
          {
            $sort: {
              "branches.branchName": 1,
            },
          },
          {
            $skip: limit * page,
          },
          {
            $limit: limit,
          },
          {
            $group: {
              _id: "$id",
              branches: {
                $push: "$courses.branches",
              },
            },
          },
        ]).collation({
          locale: "en",
          strength: 1,
        });

        console.log({
          ...totalBranches[0],
        });
        return {
          ...totalBranches[0],
        };
      } else {
        console.log("else case");
        let page = Math.max(0, pageNumber);
        const totalBranches = await Course.aggregate([
          {
            $match: {
              _id: ObjectId(courseId),
            },
          },
          {
            $unwind: "$branches",
          },

          {
            $sort: {
              "branches.branchName": 1,
            },
          },
          {
            $skip: limit * page,
          },
          {
            $limit: limit,
          },
          {
            $group: {
              _id: "$id",
              branches: {
                $push: "$branches",
              },
            },
          },
          {
            $project: {
              branches: 1,
              _id: 0,
            },
          },
        ]).collation({
          locale: "en",
          strength: 1,
        });

        console.log({
          ...totalBranches[0],
        });
        return {
          ...totalBranches[0],
        };
      }
    },
    searchUniversity: async (_, { universityName }, context, info) => {
      if (!context.req.isAuth) {
        throw new AuthenticationError("You are not authenticated");
      }
      const searchedUniversity = await University.aggregate([
        {
          $search: {
            index: "default",
            text: {
              path: "universityName",
              query: universityName,
              fuzzy: {
                maxEdits: 2,
                maxExpansions: 100,
              },
            },
            highlight: {
              path: "universityName",
            },
          },
        },
        {
          $project: {
            _id: 0,
            universityName: 1,
            photoURL: 1,
          },
        },
      ]);
      //  console.log(searchedUniversity);
      return searchedUniversity;
    },
    searchCollege: async(_,{universityId,collegeName},context,info)=>{

      if(typeof universityId !== "undefined" && universityId){
      
        console.log("id ");
        const searchedCollege = University.aggregate([
          {
            $search: {
              index: "default",
              text: {
                path: "college.collegeName",
                query: collegeName,
                fuzzy: {
                  maxEdits: 2,
                  maxExpansions: 100,
                },
              },
              highlight: {
                path: "college.collegeName",
              },
            },
          },
          {
            $project: {
              _id: 0,
              college: 1,
             
            },
          },
        ]);

        console.log({...searchedCollege[0]});
        return searchedCollege;
      }
      else{
        const searchedCollege = College.aggregate([
          {
            $search: {
              index: "default",
              text: {
                path: "collegeName",
                query: collegeName,
                fuzzy: {
                  maxEdits: 2,
                  maxExpansions: 100,
                },
              },
              highlight: {
                path: "collegeName",
              },
            },
          },
          {
            $project: {
              _id: 0,
              collegeName: 1,
              photoURL: 1,
            },
          },
        ]);
        console.log(searchedCollege);
        return searchedCollege;
      }
    },
    searchCourses: async(_,{courseName},context,info)=>{
      if (!context.req.isAuth) {
        throw new AuthenticationError("You are not authenticated");
      }
      const searchedCourse = await Course.aggregate([
        {
          $search: {
            index: "default",
            text: {
              path: "courseName",
              query: courseName,
              fuzzy: {
                maxEdits: 2,
                maxExpansions: 100,
              },
            },
            highlight: {
              path: "courseName",
            },
          },
        },
        {
          $project: {
            _id: 0,
            courseName: 1,
            photoURL: 1,
          },
        },
      ]);
      // console.log(searchedCourse);
      return searchedCourse;
    }
  },
  Mutation: {
    createUser: async (
      _,
      { userId, name, email, photoURL, phoneNumber },
      context,
      info
    ) => {
      if (!context.req.isAuth) {
        throw new AuthenticationError("You are not authenticated");
      }
      const newUser = new User({
        userId,
        name,
        email,
        photoURL,
        phoneNumber,
      });
      await newUser.save();
      console.log(newUser);
      return newUser;
    },
    createUniversity: async (
      _,
      { universityId, universityName, photoURL, collegeName },
      context,
      info
    ) => {
      const newUniversity = new University({
        universityId,
        universityName,
        photoURL,
      })
        .college()
        .push({
          collegeName,
        });
      await newUniversity.save();
      console.log(newUniversity);
      return newUniversity;
    },
    createCollege: async (
      _,
      { collegeName, universityId, universityName, photoURL },
      context,
      info
    ) => {
      const newCollege = new College({
        collegeName,
        universityId,
        universityName,
        photoURL,
      });
      await newCollege.save();
      console.log(newCollege);
      return newCollege;
    },
    createCourse: async (
      _,
      { courseId, courseName, collegeId, collegeName },
      context,
      info
    ) => {
      const newCourse = new Course({
        courseId,
        courseName,
        collegeId,
        collegeName,
      });
      await newCourse.save();
      console.log(newCourse);
      return newCourse;
    },
    setUserInfo: async (_, args, context, info) => {
      if (!context.req.isAuth) {
        throw new AuthenticationError("You are not authenticated");
      }
      const searchedUser = await User.findOneAndUpdate(
        {
          userId: args.userId,
        },
        {
          $set: {
            name: args.name,
            email: args.email,
            phoneNumber: args.phoneNumber,
            level: args.level,
            active: args.active,
            collegeId: args.collegeId,
            collegeName: args.collegeName,
            branchName: args.branchName,
            branchId: args.branchId,
            courseId: args.courseId,
            courseName: args.courseName,
            semYear: args.semYear,
          },
        },
        {
          new: true,
        }
      ).exec();

      return searchedUser;
    },
  },
};

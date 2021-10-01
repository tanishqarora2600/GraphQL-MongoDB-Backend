import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type universityWithPageNumber {
    University: [University!]!
    currentPageNumber: Int!
    totalPages: Int!
  }
  type collegeWithPageNumber {
    college: [College!]
    currentPageNumber: Int!
    totalPages: Int!
  }
  input newCollege {
    id: ID!
    collegeName: String
    photoURL: String
  }
  type coursesWithPageNumber {
    courses: [Course!]
    currentPageNumber: Int!
    totalPages: Int!
  }
  type branchesWithPageNumber {
    branches: [Branch!]
    currentPageNumber: Int!
    totalPages: Int!
  }

  type Query {
    getUserInfo(userId: String!): User!
    getUniversities(pageNumber: Int!, limit: Int!): universityWithPageNumber!
    getColleges(
      pageNumber: Int!
      limit: Int!
      universityId: ID!
    ): collegeWithPageNumber!
    getCourses(
      pageNumber: Int!
      limit: Int!
      collegeId: String
    ): coursesWithPageNumber!
    getBranches(
      pageNumber: Int!
      limit: Int!
      collegeId: String
      courseId: String!
    ): branchesWithPageNumber!
    searchUniversity(universityName: String!): [University!]
    searchCollege(universityId:ID,collegeName:String): [College!]
    searchCourses(courseName:String!):[Course!]
  }

  type User {
    userId: String!
    name: String
    email: String
    photoURL: String!
    level: Int
    active: Boolean
    phoneNumber: String
    collegeName: String
    collegeId: String
    branchName: String
    branchId: String
    courseName: String
    courseId: String
    semYear: String
    universityId: String
    universityName: String
  }
  type University {
    id: ID
    universityName: String
    photoURL: String
    college: [College!]
  }

  type College {
    id: ID
    collegeName: String
  }
  type Course {
    id: ID
    courseName: String
    branches: [Branch!]
  }
  type Branch {
    id: ID
    branchName: String
  }
  type Mutation {
    createUser(
      userId: String!
      email: String
      photoURL: String!
      phoneNumber: String
    ): User!
    createUniversity(
      college: newCollege!
      universityId: String!
      universityName: String!
      photoURL: String!
    ): University!
    createCollege(
      collegeName: String!
      universityId: String!
      universityName: String!
      photoURL: String!
    ): College!
    createCourse(
      courseId: String!
      courseName: String!
      collegeId: String!
      collegeName: String!
    ): Course!
    setUserInfo(
      userId: String!
      name: String
      email: String
      level: Int
      active: Boolean
      phoneNumber: String
      collegeName: String
      collegeId: String
      branchName: String
      branchId: String
      courseName: String
      courseId: String
      semYear: String
    ): User!
  }
`;

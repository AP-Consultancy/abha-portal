import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Timetable from "../pages/Timetable";
import MyTimetable from "./timetable/MyTimetable";

const RoleAwareTimetable = () => {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  if (userRole === "admin") {
    return <Timetable />;
  }

  return <MyTimetable />;
};

export default RoleAwareTimetable;
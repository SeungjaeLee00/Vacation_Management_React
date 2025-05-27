import axios from "axios";

const API_BASE_URL = "http://localhost:8088/api";

// 내 휴가 목록 조회
export const getMyVacations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vacations/my-vacations`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "내 휴가 목록 조회 실패";
  }
};

// 내 부서 휴가 목록 조회
export const getMyDepartmentVacations = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/vacations/my-department`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "내 부서 휴가 목록 조회 실패";
  }
};

// 공휴일 목록 조회
export const getHolidayList = async (
  startYear,
  startMonth,
  endYear,
  endMonth
) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/holidays/get-holiday`, {
      params: {
        startYear,
        startMonth,
        endYear,
        endMonth,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "공휴일 목록 조회 실패";
  }
};

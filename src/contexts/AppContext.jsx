import React, { createContext, useContext, useReducer } from "react";

const AppContext = createContext();

const initialState = {
  selectedStudent: null,
  loading: false,
  error: null,
  feeData: null,
  transactions: [],
};

const appReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_STUDENT":
      return { ...state, selectedStudent: action.payload, error: null };
    case "SET_FEE_DATA":
      return { ...state, feeData: action.payload, loading: false };
    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.payload };
    case "UPDATE_FEE_COLLECTION":
      return {
        ...state,
        feeData: {
          ...state.feeData,
          feeCollections: state.feeData.feeCollections.map((fee) =>
            fee._id === action.payload.id ? action.payload.data : fee
          ),
        },
      };
    case "CLEAR_DATA":
      return { ...initialState };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

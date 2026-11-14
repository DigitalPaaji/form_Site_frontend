import { createSlice } from "@reduxjs/toolkit";


const clientSlice = createSlice({
    name:"client",
    initialState:{client:null},
    reducers:{
    addclient: (state, action) => {
      state.client = action.payload;
    },

    removeclient: (state) => {
      state.client = null;
    },
    addFormPage:(state,action)=>{
      if (!state.client) return;

  if (!Array.isArray(state.client.formPage)) {
    state.client.formPage = [];
  }

  state.client.formPage.push(action.payload);

    },
    UpdateFormPage:(state,action)=>{
      if (!state.client) return;

  if (!Array.isArray(state.client.formPage)) {
    state.client.formPage = [];
  }

  const index = state.client.formPage.findIndex(
    (item) => item._id === action.payload._id
  );

//  const newUpdate = state.client.formPage.map((item)=>item._id==action.payload._id ? action.payload : item)
//      state.client.formPage = newUpdate;

  if (index !== -1) {
    state.client.formPage[index] = {
      ...state.client.formPage[index],
      ...action.payload,
    };
  }

      
    },
    removeFormPage :(state,action)=>{
    const filterPage = state.client.formPage.filter((item)=>item._id != action.payload)

state.client.formPage=filterPage

    }
    }
})



export const { addclient, removeclient,addFormPage,UpdateFormPage ,removeFormPage} = clientSlice.actions;

export default clientSlice.reducer;
import { activeUser } from "../../app.js";

export const getIndex = (name)=>{
    return  activeUser.findIndex((u) => u?.name === name);
}

export const getDisConnUser = (name)=>{
    return activeUser?.find((user)=>user?.name==name)
}
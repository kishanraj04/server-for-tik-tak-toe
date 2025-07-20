import { activeUser } from "../../app.js";
export const getSockets = (name)=>{
    const user = activeUser.find(u => u.name === name);
    return user;
}
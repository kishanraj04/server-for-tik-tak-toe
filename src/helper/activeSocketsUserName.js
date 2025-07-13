import { activeUser } from "../../app.js";

export const activeSocketsUserName = (si)=>{
    const activeu = activeUser?.filter((cusr)=>cusr?.socketId!=si)
    return activeu
}
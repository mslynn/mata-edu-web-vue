/**
 *  工具中心
 */
import { useHttp } from "./useHttp";

export interface tool {
    userId: string;
    nickName: string;
    userName: string;
    teacherAccount: string;
    phonenumber: number;
    createTime: string;
}


export const cityAdmin = () => {

    const http = useHttp();



    return {

    };
}
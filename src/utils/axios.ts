import axios from 'axios'
import type {AxiosInstance} from 'axios'

const request: AxiosInstance = axios.create({
    baseURL: 'https://api.miaaoo.com/',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
})


export const mc_list = (): Promise<any> => {
    return request({
        url: '/list',
        method: 'get',
    })
}

export const mc_join = (roomFrom: string, addId: string, roomId: string, sessionName: string, userXuid: string, verifyCode: string): Promise<any> => {
    return request({
        url: '/join',
        method: 'post',
        data: {
            version: '1.0.0',
            joininformation: {
                addid: addId,
                roomfrom: roomFrom,
                roomid: roomId,
                sessionname: sessionName,
            },
            invitecontrol: {
                userxuid: userXuid,
                verifycode: verifyCode,
            }
        }
    })
}
export const mc_xuid = (Xuid: string): Promise<any> => {
    return request({
        url: '/getxuid',
        method: 'get',
        params: {
            gametag: Xuid,

        }
    })
}
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

export const mc_join = (roomFrom: string, addId: string, roomId: string, sessionName: string, userXuid: string): Promise<any> => {
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
            }
        }
    })
}

export const mc_account = (): Promise<any> => {
    return request({
        url: '/account',
        method: 'get',
    })


}

export const mc_profile = (gt: string): Promise<any> => {
    return request({
        url: '/profile',
        method: 'get',
        params: {
            gt: gt,

        }
    })


}
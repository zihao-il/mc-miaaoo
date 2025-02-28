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
        method: 'post',
    })
}

export const mc_join = (roomFrom: string, addId: number, roomId: string, sessionName: string, userXuid: string): Promise<any> => {
    return request({
        url: '/join',
        method: 'post',
        params: {
            roomfrom: roomFrom,
            addid: addId,
            roomid: roomId,
            sessionname: sessionName,
            userxuid: userXuid
        }
    })
}

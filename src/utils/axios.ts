import axios from 'axios'
import type {AxiosInstance} from 'axios'

const request: AxiosInstance = axios.create({
    baseURL: 'https://mc.miaaoo.com:10101/',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
})


export const mc_list = (): Promise<any> => {
    return request({
        url: '/test-list',
        method: 'post',
    })
}

export const mc_join = (roomFrom: string, addId: number, roomId: string, sessionName: string): Promise<any> => {
    return request({
        url: '/test-join',
        method: 'post',
        params: {
            roomfrom: roomFrom,
            addid: addId,
            roomid: roomId,
            sessionname: sessionName
        }
    })
}

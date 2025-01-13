import axios from 'axios'
import type {AxiosInstance, AxiosRequestConfig} from 'axios'

const request: AxiosInstance = axios.create({
    baseURL: 'https://bbk.endyun.ltd/api',
    // baseURL: 'http://127.0.0.1:9000/api',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
})

interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
    request?: any;
}

export const xbox_online = function (): Promise<ApiResponse> {
    return request({
        url: '/xbox_online',
        method: 'post',
    })
}

export const xbox_avatar = <T = any>(data: T): Promise<ApiResponse> => {
    return request({
        url: '/xbox_avatar',
        method: 'post',
        data: data
    })
}

export const xbox_room = <T = any>(data: T): Promise<ApiResponse> => {
    return request({
        url: '/xbox_room',
        method: 'post',
        data: data
    })
}
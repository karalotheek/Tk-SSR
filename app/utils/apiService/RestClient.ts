import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

axios.defaults.headers.common.Accept = 'application/json';
axios.defaults.timeout = 12000;

const getHttpHeaders = (isAuthenticated = false): AxiosRequestConfig => {
  // Add your custom logic here, for example add a Token to the Headers
  if (isAuthenticated) {
    return {
      headers: {
        Authorization: 'Bearer YOUR_TOKEN',
      },
    };
  }

  return {};
};

const GET = (path: string): Promise<AxiosResponse> =>
  axios.get(path, getHttpHeaders());

const DELETE = (path: string): Promise<AxiosResponse> =>
  axios.delete(path, getHttpHeaders());

const POST = (path: string, data: any): Promise<AxiosResponse> =>
  axios.post(path, data, getHttpHeaders());

const PUT = (path: string, data: any): Promise<AxiosResponse> =>
  axios.post(path, data, getHttpHeaders());

const PATCH = (path: string, data: any): Promise<AxiosResponse> =>
  axios.post(path, data, getHttpHeaders());

export const APISERVICE = { GET, DELETE, POST, PUT, PATCH };

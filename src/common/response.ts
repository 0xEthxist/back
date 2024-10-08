
export const send_response = (responseArg: ResponseArg) => {
    
    if(responseArg?.data?.message)
        responseArg.message = responseArg.data.message
        
    if (!responseArg.message)
        responseArg.message = 'api request'

    if (responseArg.success == undefined)
        responseArg.success = true

    if (responseArg?.data.success === false)
        responseArg.success = false

    return {
        success: responseArg.success,
        message: responseArg.message,
        data: responseArg.data,
        ...responseArg.extra
    }
}

export interface ResponseArg {
    success?: boolean;
    message?: string;
    data: any;
    extra?: any;
}
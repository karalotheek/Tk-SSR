import { useState, useEffect } from "react";
import { getUserById } from "@services/users";
import { useDispatch } from 'react-redux';
import { updateLoggedInUserData } from "@context/actions";

export const useSetLoggedInUser = (userId: string, data: any) => {
    const dispatch = useDispatch();
    const [userData, setUserData] = useState<any>(null)

    useEffect(() => {
        if (userId) {
            getUserById(userId).subscribe((response: any) => {
                dispatch(updateLoggedInUserData(userId));
                setUserData(response);
            })
        }
    }, [userId]);

    return [userData];
};


export const useGetAndSetLoggedInUser = (userId: string) => {
    const dispatch = useDispatch();
    const [userData, setUserData] = useState<any>(null)

    useEffect(() => {
        if (userId) {
            getUserById(userId).subscribe((response: any) => {
                dispatch(updateLoggedInUserData(userId));
                setUserData(response);
            })
        }
    }, [userId]);

    return [userData];
};

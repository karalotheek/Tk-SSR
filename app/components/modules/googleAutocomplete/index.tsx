import { DEFAULT_CENTER_LATITUDE, DEFAULT_CENTER_LONGITUDE, DEFAULT_DELIVERY_RADIUS, GEOCODER_OPTION, GOOGLE_MAP_API_KEY, PRIMARY_COLOUR, PRIMARY_PINK_COLOUR } from '@constant/defaultValues';
import { AddressType } from '@type/common';
import React, { FC, useEffect, useState } from 'react';
import GooglePlacesAutocomplete, { geocodeByLatLng } from 'react-google-places-autocomplete';
import SvgIcon from '@element/svgIcon';
import { useSelector, useDispatch } from 'react-redux';
import { disableLoader, enableLoader, showError } from '@context/actions';
import { setAddressObj, validateAddress } from '@services/util';

type autoCompleteProps = {
    handleAutocompleteSuccess: any;
    isValidate: any;
    autocompletePlaceHolder?: string;
}
const GoogleAutocomplete: FC<autoCompleteProps> = ({ handleAutocompleteSuccess, isValidate, autocompletePlaceHolder }) => {
    const dispatch = useDispatch();
    const [searchedLocation, setSearchedLocation] = useState<any>()
    //address section
    useEffect(() => {
        if (autocompletePlaceHolder) {
            setSearchedLocation(autocompletePlaceHolder);
        }
    }, [autocompletePlaceHolder]);

    const onAutocompleteSelected = (result: any) => {
        console.log(result)
        let selectedLocationCopy = null;

        var geocoder = new google.maps.Geocoder();
        var address = result.label;
        geocoder.geocode({ 'address': address }, function (results: any, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();
                const searchedLatLng = {
                    lat: latitude,
                    lng: longitude
                }
                if (!isValidate || validateAddress(searchedLatLng)) {
                    selectedLocationCopy = result;
                    selectedLocationCopy.latLng = searchedLatLng;
                    setSearchedLocation(result);
                    handleAutocompleteSuccess(selectedLocationCopy);
                } else {
                    dispatch(disableLoader());
                    dispatch(showError(`Currently we are unserviceable at this location: ${result.label}, Try another!`, 10000));
                    setSearchedLocation(null);
                }
            }
        });
    }

    const locateMe = () => {
        let selectedLocationCopy: AddressType;
        dispatch(enableLoader());
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    let centerPoint = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                    geocodeByLatLng(centerPoint).then((data: any) => {
                        // console.log('Successfully got latitude and longitude', data);
                        if (data && data.length != 0 && data[0] && data[0].formatted_address) {
                            let searchedLatLng = {
                                lat: data[0].geometry.location.lat(),
                                lng: data[0].geometry.location.lng(),
                            }
                            if (validateAddress(searchedLatLng)) {
                                selectedLocationCopy = data[0];
                                selectedLocationCopy.latLng = searchedLatLng;
                                setSearchedLocation(data[0]);
                                handleAutocompleteSuccess(selectedLocationCopy);
                                dispatch(disableLoader());
                            } else {
                                dispatch(disableLoader());
                                dispatch(showError(`Currently we are unserviceable at this location: ${data[0].formatted_address}, Try another!`, 10000));
                            }
                        } else {
                            dispatch(disableLoader());
                            dispatch(showError('We are having trouble determining your location, Please try to enter your location !', 5000));
                        }
                    }).catch((err) => {
                        dispatch(disableLoader());
                        dispatch(showError('We are having trouble determining your location, Please try to enter your location !', 5000));
                    })
                }, handleLocationError, GEOCODER_OPTION);
        } else {
            dispatch(disableLoader());
            dispatch(showError('We are having trouble determining your location, Please try to enter your location !', 5000));
        }
    }

    const handleLocationError = (error: any) => {
        dispatch(disableLoader());
        dispatch(showError('We are having trouble determining your location, Please try to enter your location !', 5000));
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.log("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.log("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                console.log("The request to get user location timed out.");
                break;
            case error.PERMISSION_DENIED:
                console.log("An unknown error occurred.");
                break;
        }
    }

    const onfocusInput = () => {
        console.log('focused')
    }
    return (
        <div className="google-location-wrap clearfix">
            <div className="autocomplete-me-wrapp">
                <GooglePlacesAutocomplete
                    apiKey={GOOGLE_MAP_API_KEY}
                    autocompletionRequest={{
                        componentRestrictions: {
                            country: ['IN'],
                        },
                        // radius: 10000,//in meter
                        // location: {
                        //     lat: 18.496668,
                        //     lng: 73.941666
                        // },
                        // types: ['geocode', 'postal_code', 'address',]
                    }}
                    debounce={1000}
                    minLengthAutocomplete={3}
                    selectProps={{
                        value: searchedLocation,
                        inputClassName: "google-auto",
                        placeholder: 'Select your address',
                        onMenuOpen: { onfocusInput },
                        onChange: onAutocompleteSelected,
                        styles: {
                            control: (provided: any) => ({
                                ...provided,
                                padding: '5px 10px',
                                border: '1px solid #a3a3a3',
                                borderRadius: '10px',
                                filter: 'drop-shadow(5px 5px 4px #fdfdfd2b)',
                                // boxShadow: ' 0 8px 30px #dee1ec2b',
                                backgroundColor: '#fdfdfd',
                                fontFamily: 'SemiBold',
                                fontSize: '12px',
                            }),
                            indicatorContainer: () => {
                                display: 'none'
                            },
                            indicatorSeparator: () => {
                                display: 'none'
                            },
                            input: (provided: any) => ({
                                ...provided,
                                color: PRIMARY_COLOUR,
                            }),
                            menu: (provided: any) => ({
                                ...provided,
                                backgroundColor: 'white',
                                border: '1px solid #a3a3a3',
                                borderRadius: '10px',
                                padding: '10px',
                                margin: '0',
                                lineHeihtL: '15px',
                                transition: 'all 300ms ease-in'
                            }),
                            option: (provided: any) => ({
                                ...provided,
                                color: 'black',
                                fontSize: '11px',
                                fontFamily: 'Regular',
                                fontWeight: 400,
                                margin: "0px 0 8px 0",
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                border: '1px solid #a3a3a3',
                                padding: '10px',
                                lineHeight: '18px',
                                transition: 'all 300ms ease-in'
                            }),
                            singleValue: (provided: any) => ({
                                ...provided,
                                color: PRIMARY_COLOUR,
                                fontFamily: 'SemiBold',
                                padding: '10px 0',
                                transition: 'all 300ms ease-in'
                            })
                        },
                    }}
                    onLoadFailed={(error) => (
                        console.error("Could not inject Google script GooglePlacesAutocomplete", error)
                    )}
                />
            </div>
            <div className="locate-me-wrapp">
                <div className="action-btn-icon" onClick={locateMe}>
                    <SvgIcon icon="locateme" />
                </div>
            </div>
        </div>
    )
}

export default GoogleAutocomplete

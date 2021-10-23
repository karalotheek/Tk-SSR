import React, { FC, useState, useRef, useCallback, useEffect } from 'react';
import { GoogleMap, withScriptjs, withGoogleMap, Marker, Circle } from 'react-google-maps';
import { DEFAULT_CENTER_LATITUDE, DEFAULT_CENTER_LONGITUDE, DEFAULT_DELIVERY_RADIUS, GEOCODER_OPTION, GOOGLE_MAP_API_KEY, PRIMARY_COLOUR, PRIMARY_PINK_COLOUR } from '@constant/defaultValues';
import { setAddressObj, validateAddress } from '@services/util';
import { showError } from '@context/actions';
const { SearchBox } = require("react-google-maps/lib/components/places/SearchBox");
import { useSelector, useDispatch } from 'react-redux';
import { AddressType } from '@type/common';

const Map: FC<any> = ({ initialMarkerPosition, isNewAddress, handleLocationPickerSuccess }) => {
    const dispatch = useDispatch();
    const defaultMapOptions = {
        fullscreenControl: false,
        panControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
        },
        mapTypeId: "roadmap"
        // styles: [
        //     { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        //     { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        //     { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        //     {
        //         featureType: "administrative.locality",
        //         elementType: "labels.text.fill",
        //         stylers: [{ color: "#d59563" }],
        //     },
        //     {
        //         featureType: "poi",
        //         elementType: "labels.text.fill",
        //         stylers: [{ color: "#d59563" }],
        //     },
        //     {
        //         featureType: "poi.park",
        //         elementType: "geometry",
        //         stylers: [{ color: "#263c3f" }],
        //     },
        //     {
        //         featureType: "poi.park",
        //         elementType: "labels.text.fill",
        //         stylers: [{ color: "#6b9a76" }],
        //     },
        //     {
        //         featureType: "road",
        //         elementType: "geometry",
        //         stylers: [{ color: "#38414e" }],
        //     },
        //     {
        //         featureType: "road",
        //         elementType: "geometry.stroke",
        //         stylers: [{ color: "#212a37" }],
        //     },
        //     {
        //         featureType: "road",
        //         elementType: "labels.text.fill",
        //         stylers: [{ color: "#9ca5b3" }],
        //     },
        //     {
        //         featureType: "road.highway",
        //         elementType: "geometry",
        //         stylers: [{ color: "#746855" }],
        //     },
        //     {
        //         featureType: "road.highway",
        //         elementType: "geometry.stroke",
        //         stylers: [{ color: "#1f2835" }],
        //     },
        //     {
        //         featureType: "road.highway",
        //         elementType: "labels.text.fill",
        //         stylers: [{ color: "#f3d19c" }],
        //     },
        //     {
        //         featureType: "transit",
        //         elementType: "geometry",
        //         stylers: [{ color: "#2f3948" }],
        //     },
        //     {
        //         featureType: "transit.station",
        //         elementType: "labels.text.fill",
        //         stylers: [{ color: "#d59563" }],
        //     },
        //     {
        //         featureType: "water",
        //         elementType: "geometry",
        //         stylers: [{ color: "#17263c" }],
        //     },
        //     {
        //         featureType: "water",
        //         elementType: "labels.text.fill",
        //         stylers: [{ color: "#515c6d" }],
        //     },
        //     {
        //         featureType: "water",
        //         elementType: "labels.text.stroke",
        //         stylers: [{ color: "#17263c" }],
        //     },
        // ]
    };

    const [mapCenter, setMapCenter] = useState(initialMarkerPosition || { lat: DEFAULT_CENTER_LATITUDE, lng: DEFAULT_CENTER_LONGITUDE });
    const refMap = useRef<any>(null);
    const refCircle = useRef<any>(null);
    const [timer, setTimer] = useState<any>(0);
    const [mapZoom, setMapZoom] = useState(10);
    const [markerCenter, setMarkerCenter] = useState({ lat: DEFAULT_CENTER_LATITUDE, lng: DEFAULT_CENTER_LONGITUDE })

    useEffect(() => {
        if (initialMarkerPosition && initialMarkerPosition.lat) {
            setMarkerCenter(initialMarkerPosition);
            setMapCenter(initialMarkerPosition)
            // console.log("initialMarkerPosition", initialMarkerPosition)
        }
    }, [initialMarkerPosition])


    useEffect(() => {
        if (isNewAddress) {
            navigator.geolocation.getCurrentPosition(
                (success) => {
                    const { latitude, longitude } = success.coords;
                    setTimeout(() => {
                        setMarkerCenter({ lat: latitude, lng: longitude });
                    }, 4000);
                },
                (error) => {
                    console.log(error);
                },
                GEOCODER_OPTION
            );
        }
    }, [isNewAddress])

    useEffect(() => {
        if (refCircle.current) {
            let centerSfo = new google.maps.LatLng(mapCenter);
            let circle = new google.maps.Circle({ radius: 10000, center: centerSfo });
            let bounds = circle.getBounds();
            refMap.current.fitBounds(bounds);
            setTimeout(() => {
                setMapZoom(19)
            }, 3000);
        }
    }, [refCircle])

    useEffect(() => {
        if (markerCenter && markerCenter.lat) {
            // console.log("new map markerCenter", markerCenter)
            if (timer) {
                clearTimeout(timer);
            }
            setTimer(setTimeout(() => {
                geocodePosition(markerCenter);
            }, 2000));
        }
    }, [markerCenter]);

    const geocodePosition = (markerPosition: any) => {
        let geocoder = new google.maps.Geocoder();
        let latlng = new google.maps.LatLng(markerPosition.lat, markerPosition.lng);
        geocoder.geocode({ location: latlng }, function (responses: any) {
            if (responses && responses.length > 0) {
                // console.log("location picker result", responses[0]);
                let selectedLocation: any = responses[0];
                selectedLocation.latlng = markerPosition;
                handleLocationPickerSuccess(selectedLocation);
            } else {
                console.log('Cannot determine address at this location.');
            }
        });
    }

    const handleBoundsChanged = () => {
        const currentMapCenter = refMap.current.getCenter(); //get map center
        let centerSfo = new google.maps.LatLng(mapCenter);
        let circle = new google.maps.Circle({ radius: 10100, center: centerSfo });
        let bounds: any = circle.getBounds();
        if (validateAddress({ lat: currentMapCenter.lat(), lng: currentMapCenter.lng() })) {
            setMarkerCenter({ lat: currentMapCenter.lat(), lng: currentMapCenter.lng() });
        } else {
            dispatch(showError(`Currently we are unserviceable at this location, Try to select location inside circular area`, 5000));
        }

    };

    return (
        <GoogleMap
            ref={refMap}
            zoom={mapZoom}
            center={mapCenter}
            onBoundsChanged={useCallback(handleBoundsChanged, [])}
            defaultOptions={defaultMapOptions}
        >
            <Marker
                position={markerCenter}
                icon={{
                    url: '/assets/svg/location.svg',
                }}
            />
            <Circle ref={refCircle} center={mapCenter} radius={10000} options={{ strokeColor: 'pink', strokeWeight: 4, fillOpacity: 0.1, fillColor: 'pink' }} />
        </GoogleMap >
    );
}

const WrappedMap = withGoogleMap(Map);

type GoogleMapLocationPickerProps = {
    initialMarkerPosition: any,
    isNewAddress: boolean,
    handleLocationPickerSuccess: any,
}
const GoogleMapLocationPicker: FC<GoogleMapLocationPickerProps> = ({ initialMarkerPosition, isNewAddress, handleLocationPickerSuccess }) => {
    return (
        <div>
            <WrappedMap
                initialMarkerPosition={initialMarkerPosition}
                isNewAddress={isNewAddress}
                handleLocationPickerSuccess={handleLocationPickerSuccess}
                googleMapURL={'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyAnMUW87s3qrcidO5P2cLN86_rurC2s5QI'}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `500px` }} />}
                mapElement={<div style={{ height: `100%` }} />}
            />
        </div>
    )
}
export default GoogleMapLocationPicker;
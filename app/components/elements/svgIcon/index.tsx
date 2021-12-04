/* eslint-disable max-len */
import Logo from "@svgs/logo.svg";
import AddToCart from "@svgs/addToCart.svg";
import RemoveFromCart from "@svgs/removeFromCart.svg";
import Cart from "@svgs/cart.svg";
import Close from "@svgs/close.svg";
import Cancel from "@svgs/cancel.svg";
import Send from "@svgs/send.svg";
import Work from "@svgs/work.svg";
import Home from "@svgs/home.svg";
import Home2 from "@svgs/home2.svg";
import Home3 from "@svgs/home3.svg";
import Info from "@svgs/info.svg";
import User from "@svgs/user.svg";
import Add from "@svgs/add.svg";
import Edit from "@svgs/edit.svg";
import Remove from "@svgs/remove.svg";
import Delete from "@svgs/delete.svg";
import LocateMe from "@svgs/locateme.svg";
import Location from "@svgs/location.svg";
import UserLocation from "@svgs/userLocation.svg";
import Location2 from "@svgs/location2.svg";
import AttachFile from "@svgs/attachFile.svg";
import Incomming from "@svgs/incomming.svg";
import Next from "@svgs/next.svg";
import Back from "@svgs/back.svg";
import Reset from "@svgs/reset.svg";
import Verify from "@svgs/verify.svg";
import Expand from "@svgs/expand.svg";
import AddUser from "@svgs/addUser.svg";
import Login from "@svgs/login.svg";
import Checkbox from "@svgs/checkbox.svg";
import AddAddress from "@svgs/addAddress.svg";
import Categories from "@svgs/categories.svg";
import Search from "@svgs/search.svg";
import { FC } from "react";

const icons: any = {
    logo: Logo,
    addToCart: AddToCart,
    removeFromCart: RemoveFromCart,
    cart: Cart,
    close: Close,
    cancel: Cancel,
    send: Send,
    work: Work,
    home: Home,
    home2: Home2,
    home3: Home3,
    info: Info,
    user: User,
    add: Add,
    edit: Edit,
    remove: Remove,
    delete: Delete,
    locateme: LocateMe,
    location2: Location2,
    userLocation: UserLocation,
    location: Location,
    attachFile: AttachFile,
    next: Next,
    back: Back,
    reset: Reset,
    incomming: Incomming,
    verify: Verify,
    expand: Expand,
    addUser: AddUser,
    login: Login,
    checkbox: Checkbox,
    addAddress: AddAddress,
    categories: Categories,
    search: Search
};

type Props = {
    icon: any;
    alt?: string;
    color?: string;
    fontSize?: number;
    style?: any;
};
const getIcon = (icon: any) => icons[icon];
const SvgIcon: FC<Props> = ({ icon, alt = 'Theek Karalo', color = 'white', fontSize = 17, style }: Props) => {
    const Svg = getIcon(icon);
    return (
        <span className="svg-icon-wrap d-f-ac"
            style={{ 'color': color, 'fontSize': `${fontSize}px`, ...style }}
        >
            <Svg />
        </span>
    );
}

export default SvgIcon;

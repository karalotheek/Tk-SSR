import React from 'react';
import Header from '@module/header';
import Loader from '@module/loader';
import AlertNotification from '@module/alert';

type Props = {
  children: React.ReactNode;
};

const Default = ({ children }: Props) => (
  <div className="default clearfix">
    <Loader />
    <AlertNotification />
    <Header />
    <div className="content clearfix">{children}</div>
  </div>
);

export default Default;

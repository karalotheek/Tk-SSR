import React, { useEffect, FC } from 'react';
// Modules
import { AppProps } from 'next/app';
import { wrapper } from '@context/store/store';
// MUI Core
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
// Utils
import theme from '@layout/theme';
import '@styles/app.scss';
import Router from 'next/router';
import NProgress from 'nprogress'; //nprogress module
//Binding events. 
NProgress.configure({ showSpinner: false });
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());
import Head from 'next/head';

const WrappedApp: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAnMUW87s3qrcidO5P2cLN86_rurC2s5QI&libraries=places"></script>
      </Head>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default wrapper.withRedux(WrappedApp);

export function reportWebVitals(metric: any) {
  // console.log('Largest Contentful Paint', metric)
}
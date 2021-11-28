import db from '@firebase/admin';
import Default from '@layout/Default/defaultLayout';
import CategoryPage from '@template/category/CategoryPage'
import ServicePage from '@template/service/ServicePage'
import React, { FC, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { windowRef } from '@services/window';
import { useDispatch } from 'react-redux';
import { updateCategoriesData, updateServicesData } from '@context/actions';
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next';
import Footer from '@module/footer/footer';

export const getStaticPaths: GetStaticPaths = async () => {
    let paths: any[] = [];
    console.log('getStaticPaths start', new Date())
    const categoriesData = await db.collection('categories').orderBy('index').get();
    const categories = categoriesData.docs.map((doc) => {
        let data = doc.data();
        let category: any = {
            key: doc.id,
            ...data,
            url: ''
        }
        if (category.sUrl) {
            let url = category.sUrl.toLowerCase();
            url = url.split(" ").join("-");
            category.url = url.split("  ").join("-");
        }
        return category;
    });

    console.log('getStaticPaths cat', new Date())
    const servicesData = await db.collection('services').get();
    const services = servicesData.docs.map((doc) => {
        let data = doc.data();
        let service: any = {
            key: doc.id,
            ...data,
        }
        let category = categories.filter((data) => data.key == service.categoryId);
        if (category.length == 0) service.url = '';
        else {
            let categoryUrl = category[0].url;
            service.catUrl = categoryUrl;
            if (service && service.sUrl && categoryUrl) {
                let serviceUrl = service.sUrl.toLowerCase();
                serviceUrl = serviceUrl.split(" ").join("-");
                serviceUrl = serviceUrl.split("  ").join("-");
                serviceUrl = categoryUrl + '/' + serviceUrl;
                service.url = serviceUrl;
            } else service.url = categoryUrl;
        }
        return service;
    });
    services.map((serviceData) => {
        if (serviceData.url) {
            paths.push({ params: { pagepath: [serviceData.catUrl, serviceData.url] } });//push service url
            let isExist = paths.filter((pathData) => pathData.params.pagepath.includes(serviceData.catUrl));//check for category url is present in paths array
            if (isExist.length == 0) paths.push({ params: { pagepath: [serviceData.catUrl] } });//push category url
        }
    });

    console.log('getStaticPaths service', new Date())
    return {
        paths,
        fallback: true
    }
}

export const getStaticProps: GetStaticProps = async (context: GetStaticPropsContext<any>) => {
    console.log('GetStaticProps', new Date())
    let activeService: any[] = [];
    const categoriesData = await db.collection('categories').orderBy('index').get();
    const categories = categoriesData.docs.map((doc) => {
        let data = doc.data();
        let category: any = {
            key: doc.id,
            ...data,
            url: ''
        }
        if (category.sUrl) {
            let url = category.sUrl.toLowerCase();
            url = url.split(" ").join("-");
            category.url = url.split("  ").join("-");
        }
        return category;
    });

    console.log('GetStaticProps cat', new Date())
    const servicesData = await db.collection('services').get();
    const services = servicesData.docs.map((doc) => {
        let data = doc.data();
        let service: any = {
            key: doc.id,
            ...data,
        }
        let category = categories.filter((data) => data.key == service.categoryId);
        if (category.length == 0) {
            service.url = '';
            service.catUrl = '';
        } else {
            let categoryUrl = category[0].url;
            service.catUrl = categoryUrl;
            if (service && service.sUrl && categoryUrl) {
                let serviceUrl = service.sUrl.toLowerCase();
                serviceUrl = serviceUrl.split(" ").join("-");
                serviceUrl = serviceUrl.split("  ").join("-");
                serviceUrl = categoryUrl + '/' + serviceUrl;
                service.url = serviceUrl;
            } else service.url = categoryUrl;
        }
        return service;
    });
    console.log('GetStaticProps service', new Date())
    const activeCategory = categories.filter((cat) => cat.url == context.params.pagepath[0]);
    if (context.params.pagepath.length == 2) {
        activeService = services.filter((service) => service.url == (context.params.pagepath[0] + '/' + context.params.pagepath[1]));
    }
    return {
        props: {
            categories: categories.filter((cat: any) => cat.active),
            services: services.filter((service: any) => service.active),
            category: activeCategory && activeCategory.length != 0 ? activeCategory[0] : null,
            service: activeService && activeService.length != 0 ? activeService[0] : null,
            type: activeService && activeService.length != 0 ? 'service' : 'category'
        },
        revalidate: 10
    }
}

const CategoryServiceWrapper: FC<any> = ({ categories, services, category, service, type }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    console.log('CategoryServiceWrapper render start', new Date())
    const [activeType, setActiveType] = useState(type);
    const [activeCategories, setActiveCategories] = useState([]);
    const [activeServices, setactiveServices] = useState([]);
    const [activeCategory, setActiveCategory] = useState(category);
    const [activeService, setActiveService] = useState(service);

    useEffect(() => {
        if (windowRef && categories && services) {
            window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
            dispatch(updateCategoriesData(categories));
            dispatch(updateServicesData(services));
        }
    }, [windowRef])

    const setPreAppData = () => {
        if (categories && services && category) {
            let currentRoutes = router.asPath.split('/');
            const updatedCategory = categories?.filter((cat: any) => cat.url == currentRoutes[1]);
            categories && setActiveCategories(categories?.filter((category: any) => category.active && category.key != updatedCategory[0].key));
            setActiveCategory(updatedCategory[0]);
            if (currentRoutes.length == 2) {
                setActiveType('category');
                services && setactiveServices(services?.filter((service: any) => service.active && service.categoryId == updatedCategory[0].key));
            } else {
                setActiveType('service');
                const updatedService = services?.filter((service: any) => service.active && service.categoryId == updatedCategory[0].key && service.url == (currentRoutes[1] + '/' + currentRoutes[2]))
                if (updatedService.length) {
                    setActiveService(updatedService[0]);
                    services && setactiveServices(services?.filter((service: any) => service.active && service.categoryId == updatedCategory[0].key && service.key != updatedService[0].key));
                }
            }
            if (windowRef) {
                window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
                dispatch(updateCategoriesData(categories));
                dispatch(updateServicesData(services));
            };
        }
    }
    useEffect(() => {
        setPreAppData();
    }, [category, service])

    useEffect(() => {
        setPreAppData();
    }, [router.asPath])

    return (
        <div className="category-service-page-wrapper">
            <Default>
                {activeType == 'category' ?
                    <CategoryPage categories={activeCategories} services={activeServices} category={activeCategory} />
                    :
                    activeType == 'service' ?
                        <ServicePage categories={activeCategories} services={activeServices} category={activeCategory} service={activeService} />
                        : ''
                }
                <Footer categories={activeCategories} />
            </Default>
        </div>
    )
}

export default CategoryServiceWrapper;

import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-blue-800 text-white mt-8">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-wrap justify-around text-center md:text-right">

                    {/* Quick Access Section */}
                    <div className="w-full md:w-1/3 lg:w-1/4 mb-6 md:mb-0">
                        <h4 className="text-lg font-semibold border-b-2 border-blue-600 pb-2 mb-4 inline-block">دسترسی سریع</h4>
                        <ul>
                            <li><a href="/faq" className="hover:text-gray-300 leading-loose">سوالات متداول</a></li>
                            <li><a href="/terms" className="hover:text-gray-300 leading-loose">قوانین و مقررات</a></li>
                            <li><a href="/privacy" className="hover:text-gray-300 leading-loose">حریم خصوصی</a></li>
                        </ul>
                    </div>

                    {/* Contact Us Section */}
                    <div className="w-full md:w-1/3 lg:w-1/4 mb-6 md:mb-0">
                        <h4 className="text-lg font-semibold border-b-2 border-blue-600 pb-2 mb-4 inline-block">تماس با ما</h4>
                        <p>آدرس: تهران، خیابان نوآوری، پلاک ۱۲۳</p>
                        <p>شماره تماس: ۰۲۱-۱۲۳۴۵۶۷۸</p>
                    </div>

                </div>
            </div>
            <div className="bg-blue-900 text-center py-4">
                <p>تمامی حقوق برای رشدیار محفوظ است. © 2024</p>
            </div>
        </footer>
    );
};

export default Footer;
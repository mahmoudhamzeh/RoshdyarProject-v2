import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Modal from 'react-modal';
import './ServiceTiles.css';

const services = [
    { name: 'کودکان من', icon: '👶', link: '/my-children', id: 'my-children' },
    { name: 'نمودار رشد', icon: '📈', link: '#', id: 'growth-chart' },
    { name: 'واکسیناسیون', icon: '💉', link: '#', id: 'vaccination' },
    { name: 'مشاوره با متخصص', icon: '👨‍⚕️', link: '#', id: 'consultant' },
    { name: 'مشاوره روانشناسی', icon: '🧠', link: '#', id: 'psychology' },
    { name: 'آزمایش در محل', icon: '🔬', link: '#', id: 'lab-test' },
    { name: 'فروشگاه', icon: '🛒', link: '#', id: 'store' },
    { name: 'سرگرمی', icon: '🎮', link: '#', id: 'entertainment' },
];

Modal.setAppElement('#root');

const ServiceTiles = () => {
    const history = useHistory();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [selectedService, setSelectedService] = useState('');

    const handleServiceClick = async (serviceId) => {
        console.log(`handleServiceClick triggered for service: ${serviceId}`);
        try {
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            const userId = loggedInUser ? loggedInUser.id : null;

            if (!userId) {
                alert('لطفا برای مشاهده این بخش ابتدا وارد شوید.');
                history.push('/login');
                return;
            }

            const response = await fetch('http://localhost:5000/api/children', {
                headers: {
                    'x-user-id': userId,
                },
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Could not read error body');
                throw new Error(`خطا در دریافت اطلاعات کودکان. سرور پاسخ داد: ${errorText || response.statusText}`);
            }

            const data = await response.json();
            console.log(`Found ${data.length} children for user ${userId}.`);

            if (data.length === 0) {
                console.log('No children found, navigating to /add-child');
                alert('ابتدا باید حداقل یک کودک اضافه کنید.');
                history.push('/add-child');
            } else {
                console.log(`Found ${data.length} children. Opening child selection modal.`);
                setChildren(data);
                setSelectedService(serviceId);
                setModalIsOpen(true);
            }
        } catch (error) {
            console.error('Failed to fetch children:', error);
            alert(error.message || 'خطا در دریافت اطلاعات کودکان.');
        }
    };

    const handleModalSubmit = () => {
        if (selectedChild && selectedService) {
            const url = `/${selectedService}/${selectedChild}`;
            console.log(`Modal submit: Navigating to: ${url}`);
            history.push(url);
        } else {
            console.log('Modal submit failed: selectedChild or selectedService is missing.');
        }
    };

    return (
        <>
            <div className="tiles-container">
                {services.map(service => {
                    const requiresChild = service.id === 'growth-chart' || service.id === 'vaccination';
                    if (requiresChild) {
                        return (
                            <Link to="#" key={service.id} className="tile-link" onClick={(e) => {
                                e.preventDefault();
                                handleServiceClick(service.id);
                            }}>
                                <div className="tile">
                                    <div className="tile-icon">{service.icon}</div>
                                    <div className="tile-name">{service.name}</div>
                                </div>
                            </Link>
                        );
                    }
                    return (
                        <Link to={service.link} key={service.id} className="tile-link">
                            <div className="tile">
                                <div className="tile-icon">{service.icon}</div>
                                <div className="tile-name">{service.name}</div>
                            </div>
                        </Link>
                    );
                })}
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Select Child Modal"
                className="child-select-modal"
                overlayClassName="modal-overlay"
            >
                <h2>انتخاب کودک</h2>
                <div className="children-list-modal">
                    {children.map(child => (
                        <div
                            key={child.id}
                            className={`child-item-modal ${selectedChild === child.id ? 'selected' : ''}`}
                            onClick={() => setSelectedChild(child.id)}
                        >
                            <img src={child.avatar && child.avatar.startsWith('/uploads') ? `http://localhost:5000${child.avatar}` : (child.avatar || 'https://i.pravatar.cc/50')} alt={child.name} />
                            <span>{child.name}</span>
                        </div>
                    ))}
                </div>
                <div className="modal-actions">
                    <button onClick={handleModalSubmit} disabled={!selectedChild}>
                        تایید و ادامه
                    </button>
                    <button onClick={() => setModalIsOpen(false)}>انصراف</button>
                </div>
            </Modal>
        </>
    );
};

export default ServiceTiles;

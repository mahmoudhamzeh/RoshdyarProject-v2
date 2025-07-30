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

    const handleGrowthChartClick = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/children');
            const data = await response.json();
            if (data.length === 0) {
                alert('ابتدا باید حداقل یک کودک اضافه کنید.');
                history.push('/add-child');
            } else if (data.length === 1) {
                history.push(`/growth-chart/${data[0].id}`);
            } else {
                setChildren(data);
                setModalIsOpen(true);
            }
        } catch (error) {
            console.error('Failed to fetch children:', error);
            alert('خطا در دریافت اطلاعات کودکان.');
        }
    };

    return (
        <>
            <div className="tiles-container">
                {services.map(service => {
                    if (service.id === 'growth-chart') {
                        return (
                            <div key={service.id} className="tile-link" onClick={handleGrowthChartClick}>
                                <div className="tile">
                                    <div className="tile-icon">{service.icon}</div>
                                    <div className="tile-name">{service.name}</div>
                                </div>
                            </div>
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
                    <button onClick={() => { if (selectedChild) history.push(`/growth-chart/${selectedChild}`); }} disabled={!selectedChild}>
                        تایید و ادامه
                    </button>
                    <button onClick={() => setModalIsOpen(false)}>انصراف</button>
                </div>
            </Modal>
        </>
    );
};

export default ServiceTiles;
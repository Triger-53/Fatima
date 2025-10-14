import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { FaCalendarAlt, FaClock, FaLink, FaUser, FaVideo } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SessionDetail = () => {
    const { id } = useParams();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('sessions')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    throw error;
                }
                setSession(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSession();
        }
    }, [id]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div></div>;
    }

    if (error) {
        return <div className="max-w-6xl mx-auto px-4 py-10 text-center text-red-500"><p>Error: {error}</p></div>;
    }

    if (!session) {
        return <div className="text-center py-12"><p>Session not found.</p></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl p-6 sm:p-10"
            >
                <header className="border-b pb-6 mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">{session.title}</h1>
                    <p className="text-lg text-gray-700 mt-2">Session Details</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InfoBlock icon={<FaCalendarAlt className="text-primary-500" />} label="Date" value={new Date(session.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                    <InfoBlock icon={<FaClock className="text-primary-500" />} label="Time" value={session.time} />
                    <InfoBlock icon={<FaUser className="text-primary-500" />} label="Duration" value={`${session.duration} minutes`} />
                    {session.meet_link && (
                        <div className="md:col-span-2">
                            <InfoBlock icon={<FaVideo className="text-primary-500" />} label="Meeting Link" value={
                                <a href={session.meet_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                    {session.meet_link}
                                </a>
                            } />
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const InfoBlock = ({ icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="text-2xl mt-1">{icon}</div>
        <div>
            <p className="text-sm text-gray-700 font-medium">{label}</p>
            <div className="text-lg font-semibold text-gray-900">{value}</div>
        </div>
    </div>
);

export default SessionDetail;
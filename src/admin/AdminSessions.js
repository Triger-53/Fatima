import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { slotManager } from '../utils/slotManager';

// DEV NOTE: This component requires a `sessions` table in the database.
// A migration is needed to create this table with the following columns:
// - id (uuid, primary key)
// - user_id (uuid, foreign key to users.id)
// - title (text)
// - duration (integer)
// - date (date)
// - time (time)
// - created_at (timestamp with time zone)

const AdminSessions = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(30);
    const [numberOfSessions, setNumberOfSessions] = useState(1);
    const [sessionDates, setSessionDates] = useState(['']);
    const [sessionTimes, setSessionTimes] = useState(['']);
    const [forceBooking, setForceBooking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase.from('users').select('id, email');
            if (error) {
                console.error('Error fetching users:', error);
            } else {
                setUsers(data);
            }
        };
        fetchUsers();
    }, []);

    const handleDateChange = (index, value) => {
        const newDates = [...sessionDates];
        newDates[index] = value;
        setSessionDates(newDates);
    };

    const handleTimeChange = (index, value) => {
        const newTimes = [...sessionTimes];
        newTimes[index] = value;
        setSessionTimes(newTimes);
    };

    useEffect(() => {
        setSessionDates(Array(Number(numberOfSessions)).fill(''));
        setSessionTimes(Array(Number(numberOfSessions)).fill(''));
    }, [numberOfSessions]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser || !title) {
            setError('Please select a user and provide a title.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');

        const sessionsToInsert = sessionDates.map((date, index) => ({
            user_id: selectedUser,
            title,
            duration,
            date,
            time: sessionTimes[index],
        }));

        try {
            if (!forceBooking) {
                for (const session of sessionsToInsert) {
                    const isFree = await slotManager.isTimeSlotCompletelyFree(session.date, session.time);
                    if (!isFree) {
                        throw new Error(`Slot on ${session.date} at ${session.time} is already booked by an appointment or another session.`);
                    }
                }
            }

            const { data, error } = await supabase.from('sessions').insert(sessionsToInsert);

            if (error) {
                throw error;
            }

            setSuccess('Sessions created successfully!');
            // Reset form
            setSelectedUser('');
            setTitle('');
            setDuration(30);
            setNumberOfSessions(1);
            setSessionDates(['']);
            setSessionTimes(['']);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Manage Sessions</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user">
                        Select User
                    </label>
                    <select
                        id="user"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="">Select a user</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.email}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                        Session Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration">
                        Duration (in minutes)
                    </label>
                    <input
                        id="duration"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numberOfSessions">
                        Number of Sessions
                    </label>
                    <input
                        id="numberOfSessions"
                        type="number"
                        min="1"
                        value={numberOfSessions}
                        onChange={(e) => setNumberOfSessions(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                {Array.from({ length: numberOfSessions }).map((_, index) => (
                    <div key={index} className="flex gap-4 mb-4">
                        <div className="w-1/2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Date for Session {index + 1}
                            </label>
                            <input
                                type="date"
                                value={sessionDates[index] || ''}
                                onChange={(e) => handleDateChange(index, e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Time for Session {index + 1}
                            </label>
                            <input
                                type="time"
                                value={sessionTimes[index] || ''}
                                onChange={(e) => handleTimeChange(index, e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                    </div>
                ))}
                <div className="mb-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={forceBooking}
                            onChange={(e) => setForceBooking(e.target.checked)}
                            className="form-checkbox"
                        />
                        <span className="ml-2 text-gray-700">Force Booking (override existing appointments)</span>
                    </label>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    {loading ? 'Creating Sessions...' : 'Create Sessions'}
                </button>
            </form>
        </div>
    );
};

export default AdminSessions;
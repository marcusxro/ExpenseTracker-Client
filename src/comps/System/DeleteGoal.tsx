import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabase/supabaseClient';
import Loader from '../Loader';


interface titleType {
    titleOfGoal: string | null;
    closer: React.Dispatch<React.SetStateAction<boolean>>
}

const DeleteGoal: React.FC<titleType> = ({ titleOfGoal, closer }) => {

    const params = useParams()

    const confirmText = "delete/" + titleOfGoal
    const [inputVal, setInputVal] = useState("")
    const [loading, setLoading] = useState(false)

    const nav = useNavigate()

    async function deleteGoal() {
        setLoading(true)
        if (loading) {
            setLoading(false)
            return
        }
        if (confirmText !== inputVal) {
            setLoading(false)
            return
        }

        try {

            const { error } = await supabase
                .from('goals')
                .delete()
                .match({
                    userid: params?.uid,
                    created_at: params?.time
                });

            if (error) {
                console.error('Error deleting data:', error);
                setLoading(false)
            } else {
                nav("/user/goals")
                setLoading(false)

            }
        } catch (err) {
            console.error('Error:', err);
            setLoading(false)
        }
    }

    return (
        <div
            onClick={(e) => { e.stopPropagation() }}
            className='w-full max-w-[550px] bg-[#313131]  z-[5000] relative
    rounded-lg p-3 h-full max-h-[300px] border-[#535353] border-[1px] justify-between flex flex-col overflow-auto'>
            <div>
                <div className='text-xl font-bold'>
                    Delete goal
                </div>
                <p className='text-sm text-[#888]'>
                    To ensure that deletions are intentional and well-considered, please copy the text below.
                </p>

                <div className='mt-4 text-red-500 bg-[#222222] p-3 rounded-lg'>
                    {confirmText}
                </div>

                <input
                    value={inputVal}
                    onChange={(e) => { setInputVal(e.target.value) }}
                    placeholder='Confirm the text'
                    className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full mt-3'
                    type="text" />
            </div>

            <div className='w-full flex border-[#535353] border-[1px] overflow-hidden rounded-lg'>
                <div
                    onClick={() => { !loading && closer(prevs => !prevs) }}
                    className='p-3 bg-[#111111] outline-none  text-center border-r-[#535353] border-r-[1px] cursor-pointer text-[#888] w-full hover:bg-[#222222]'>
                    Cancel
                </div>
                <div
                    onClick={() => { deleteGoal() }}
                    className={`${confirmText === inputVal ? " bg-[#111111] text-red-500" : ' bg-[#535353]'} ${loading && 'bg-[#535353]'} p-3 outline-none  
                    flex items-center justify-center text-center border-r-[#535353] border-r-[1px] cursor-pointer text-[#888] w-full hover:bg-[#222222]`}>
                    {
                        loading ?
                            <div className='w-[20px] h-[20px]'>
                                <Loader />
                            </div>
                            :
                            "Delete"
                    }
                </div>
            </div>
        </div>
    )
}

export default DeleteGoal

import React, { useEffect, useState } from 'react'
import Sidebar from '../../comps/Sidebar'
import { FaPlus } from "react-icons/fa6";
import CreateGoals from '../../comps/System/CreateGoals';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import { supabase } from '../../supabase/supabaseClient';
import moment from 'moment';
import { BiCategory } from "react-icons/bi";
import { MdOutlineQueryStats } from "react-icons/md";
import { MdDateRange } from "react-icons/md";
import { LuLayoutTemplate } from "react-icons/lu";



interface subtaskType {
    is_done: boolean;
    startedAt: string;
    subGoal: string
}
interface habitsType {
    repeat: string;
    habit: string;
}
interface dataType {
    userid: string;
    id: number;
    title: string;
    category: string;
    is_done: boolean;
    created_at: number;
    description: string;
    sub_tasks: subtaskType[];
    habit: habitsType[];
    deadline: string;
}


const Goals: React.FC = () => {
    const [GoalListener, setGoalListener] = useState<boolean>(false)
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [isOpenSidebar, setIsOpenSidebar] = useState<boolean>(true)
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false)


    const [user] = IsLoggedIn()


    useEffect(() => {
        if (user) {
            fetchGoalsByID()
        }
    }, [GoalListener, user])


    async function fetchGoalsByID() {
        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('userid', user?.uid);

            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setFetchedData(data);
                console.log(data)
            }
        } catch (err) {
            console.log(err);
        }
    }

    function determineDate(date: string): string {
        const deadline = new Date(date);
        const now = new Date(); 
        const timeDiff = deadline.getTime() - now.getTime(); 

        // Convert milliseconds to days
        const daysUntilDeadline = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysUntilDeadline < 0) {
            return '#cc0000'; // Medium red (deadline has passed)
        } else if (daysUntilDeadline === 0) {
            return '#cc0000'; // Medium red (today is the deadline)
        } else if (daysUntilDeadline === 1) {
            return '#cc0000'; // Medium red (1 day before the deadline)
        } else if (daysUntilDeadline <= 3) {
            return '#e67e22'; // Medium orange (3 days before the deadline)
        } else if (daysUntilDeadline <= 7) {
            return '#f1c40f'; // Medium yellow (7 days before the deadline)
        } else {
            return '#2ecc71'; // Medium green (more than 7 days until the deadline)
        }
    }

    function checkDeadlineMet(deadlineString: string): JSX.Element {
        const deadline = new Date(deadlineString); 
        const now = new Date(); 
        deadline.setHours(0, 0, 0, 0); 
    
        // Check if the deadline is met
        if (deadline.getTime() === now.getTime()) {
            return (
                <div className='text-sm text-[#cc0000] flex gap-1 items-center'>
                    <MdDateRange />
                    Deadline Met
                </div>
            );
        } else {
            return (
                <div className='text-[#888] text-sm flex gap-1 items-center'>
                    <MdDateRange />
                    {deadlineString} 
                </div>
            );
        }
    }

    return (
        <div>
            <Sidebar location='Goals' />


            <div className={`ml-[86px] p-3 flex gap-3 h-[100dvh] mr-[0px] ${isOpenSidebar && "lg:mr-[370px]"}`}>
                <div className='w-full h-full'>
                    <div>
                        <div
                            className='text-2xl font-bold'>
                            Goals
                        </div>
                        <div className='text-sm text-[#888]'>
                            Easily create, edit, and organize your notes in this section for a streamlined experience.
                        </div>
                    </div>

                    <div className='mt-4 flex items-start gap-2'>
                        <div
                            onClick={() => {
                                setIsOpenSidebar(prevClick => !prevClick); setIsOpenModal(prevClick => !prevClick)
                            }}
                            className='bg-[#313131] p-3 hover:bg-[#535353] border-[#535353] border-[1px] cursor-pointer rounded-lg flex gap-2 items-center'>
                            Create Goal <span className='text-md'><FaPlus /></span>
                        </div>
                        <div className='bg-[#313131] p-4 hover:bg-[#535353] border-[#535353] border-[1px] cursor-pointer rounded-lg flex gap-2 items-center'>
                            <LuLayoutTemplate />
                        </div>
                    </div>
                    <div className='flex flex-wrap gap-3 mt-2'>
                        {
                            fetchedData && fetchedData?.map((itm: dataType, idx: number) => (
                                <div
                                    key={idx}
                                    className='w-full max-w-[300px] bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg overflow-hidden'>



                                    <div className='flex h-[110px] items-start  justify-start   border-b-[#535353] border-b-[1px]  '>
                                        <div
                                            style={{ backgroundColor: determineDate(itm?.deadline) }}
                                            className={`w-[2px] h-full`}>

                                        </div>

                                        <div className='flex flex-col p-3'>
                                            <div className='font-bold mb-1'>
                                                {itm?.title}
                                            </div>
                                            <div className='text-[#888] text-sm flex gap-1 items-center'>
                                                <BiCategory />{itm?.category}
                                            </div>
                                            <div className='text-[#888] text-sm flex gap-1 items-center'>
                                                <MdOutlineQueryStats /> {itm?.is_done ? "Completed" : "In progress"}
                                            </div>

                                            {checkDeadlineMet(itm?.deadline)} 
                                        </div>
                                    </div>

                                    <div className='flex justify-between items-center p-3 text-[#888] gap-2'>
                                        <div>
                                            {itm?.sub_tasks.filter((itmz) => itmz.is_done).length}
                                            /
                                            {itm?.sub_tasks.filter((itmz) => !itmz.is_done).length}
                                        </div>


                                        <div>
                                            {itm?.created_at
                                                ? moment(parseInt(itm?.created_at.toString())).format('MMMM Do YYYY')
                                                : 'No Creation date'}
                                        </div>
                                    </div>


                                </div>
                            ))
                        }
                    </div>
                </div>
                {
                    isOpenSidebar &&
                    <div className='ml-auto stickyPostion hidden lg:block'>
                        <CreateGoals listener={setGoalListener} purpose="Sidebar" closer={setIsOpenModal} />
                    </div>
                }

                {
                    isOpenModal &&
                    <div
                        onClick={() => {
                            setIsOpenModal(prevClick => !prevClick)
                        }}
                        className='ml-auto positioners flex items-end justify-end w-full h-full lg:hidden'>
                        <CreateGoals listener={setGoalListener} purpose="Modal" closer={setIsOpenModal} />
                    </div>
                }

            </div>
        </div >
    )
}

export default Goals

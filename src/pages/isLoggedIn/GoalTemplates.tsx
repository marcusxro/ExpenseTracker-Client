import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoChevronBackOutline } from "react-icons/io5";
import NoUserProfile from '../../assets/UserNoProfile.jpg'
import { LuLayoutDashboard } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import Marquee from 'react-fast-marquee'
import { MdPublish } from "react-icons/md";
import CreateGoals from '../../comps/System/CreateGoals';
import ChooseMethod from '../../comps/System/ChooseMethod';
import useStore from '../../Zustand/UseStore';
import ImportGoals from '../../comps/System/ImportGoals';
import UploadImport from '../../comps/System/UploadImport';
import { supabase } from '../../supabase/supabaseClient';
import IsLoggedIn from '../../firebase/IsLoggedIn';
import moment from 'moment';
import Loader from '../../comps/Loader';
import { BiCategory } from "react-icons/bi";
import { FaEllipsisH } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";
import GetAuthor from '../../comps/System/GetAuthor';
import ViewTemplate from '../../comps/System/ViewTemplate';



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
    authorUid: string;
    download_count: number
}


const GoalTemplates: React.FC = () => {
    const nav = useNavigate()
    const [isOpenCreate, setIsOpenCreate] = useState<boolean>(false)
    const [goalListener, setGoalListener] = useState<boolean>(false)
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const { showCreate, setShowCreate, templateID,  setTemplateID }: any = useStore()
    const [user] = IsLoggedIn()

    useEffect(() => {
        if (user) {
            fetchGoalsByID()
            const subscription = supabase
                .channel('public:templates')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'templates' }, (payload) => {
                    console.log('Realtime event:', payload);
                    handleRealtimeEvent(payload);
                })
                .subscribe();
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [goalListener, user])


    const handleRealtimeEvent = (payload: any) => {
        switch (payload.eventType) {
            case 'INSERT':
                setFetchedData((prevData) =>
                    prevData ? [...prevData, payload.new] : [payload.new]
                );
                break;
            case 'UPDATE':
                setFetchedData((prevData) =>
                    prevData
                        ? prevData.map((item) =>
                            item.id === payload.new.id ? payload.new : item
                        )
                        : [payload.new]
                );
                break;
            case 'DELETE':
                console.log("DELETED")
                setFetchedData((prevData) =>
                    prevData ? prevData.filter((item) => item.id !== payload.old.id) : null
                );
                break;
            default:
                break;
        }
    };

    async function fetchGoalsByID() {
        try {
            const { data, error } = await supabase
                .from('templates')
                .select('*')
                .order('download_count', { ascending: false }); // Sort by download_count in descending order


            if (error) {
                console.error('Error fetching data:', error);
            } else {
                setFetchedData(data);
            }
        } catch (err) {
            console.log(err);
        }
    }


    const [viewEllip, setViewEllip] = useState<number | null>(null)
    const [isDelete, setIsDelete] = useState<number | null>(null)



    async function deleteGoalsByID(docID: number, userUID: string) {
        if (isDelete === null) return
        try {


            const { data, error } = await supabase
                .from('templates')
                .delete()
                .match({
                    'created_at': docID,
                    'authorUid': userUID
                })

            if (error) {
                console.log(error)
            } else {
                console.log(data)
                setIsDelete(null)
                setViewEllip(null)
            }

        } catch (err) {
            console.log(err);
        }
    }


    useEffect(() => {
        console.log(isDelete)
    }, [isDelete])


    return (
        <div
            onClick={() => { setViewEllip(null) }}
            className='w-full h-full'>
            {
                isOpenCreate &&
                <div
                    onClick={() => { setIsOpenCreate(prevClick => !prevClick) }}
                    className='ml-auto positioners flex items-center justify-center p-3 w-full h-full'>
                    <ChooseMethod closer={setIsOpenCreate} />
                </div>
            }
            {
                showCreate === "Create" &&
                <div
                    onClick={() => { setShowCreate("") }}
                    className='ml-auto positioners flex items-center justify-end p-3 w-full h-full'>
                    <CreateGoals listener={setGoalListener} purpose='Modals' closer={setShowCreate} location="template" />
                </div>

            }
   {
                templateID != "" &&
                <div
                    onClick={() => { setTemplateID("") }}
                    className='ml-auto positioners flex items-center justify-center p-3 w-full h-full'>
                        <ViewTemplate />
                </div>

            }

            {
                showCreate === "Import" &&
                <div
                    onClick={() => { setShowCreate("") }}
                    className='ml-auto positioners flex items-center justify-center p-3 w-full h-full'>
                    <ImportGoals />
                </div>
            }


            {
                showCreate === "Upload" &&
                <div
                    onClick={() => { setShowCreate("") }}
                    className='ml-auto positioners flex items-center justify-center p-3 w-full h-full'>
                    <UploadImport />
                </div>
            }



            <header className='p-3 flex items-center h-auto pb-2 justify-between border-b-[#535353] border-b-[1px] overflow-auto'>
                <div className='flex items-center h-auto pb-2 justify-between w-full max-w-[1200px] mx-auto'>
                    <div className='flex gap-3 items-center'>
                        <div className='w-[35px] h-[35px] rounded-full overflow-hidden'>
                            <img
                                className='w-full h-full'
                                src={NoUserProfile} alt="" />
                        </div>
                        <div
                            onClick={() => { nav(-1) }}
                            className='flex gap-1 hover:bg-[#535353] items-center bg-[#313131] 
                        border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3'><IoChevronBackOutline /> Back</div>
                    </div>
                    <div className='flex gap-3 items-center'>
                        <div
                            className='flex gap-1 items-center bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-2 px-3 hover:bg-[#535353]'>
                            Dashboard <LuLayoutDashboard />
                        </div>
                        <div
                            className='flex gap-1 items-center bg-[#313131] border-[#535353] border-[1px] cursor-pointer rounded-lg p-3 md:p-2 px-3 hover:bg-[#535353]'>
                            <span className='hidden md:block'>Settings</span> <IoSettingsOutline />
                        </div>
                    </div>
                </div>
            </header>


            <div className='mt-3 mx-auto max-w-[1200px] p-3'>
                <div className='flex flex-col gap-2'>
                    <div className='text-xl font-bold'>
                        Choose templates
                    </div>
                    <p className='text-sm text-[#888] w-full max-w-[500px]'>
                        Select from a variety of pre-defined goal templates to help you stay organized and motivated. Easily import a template that aligns with your objectives, whether for personal development, fitness, or work projects.
                    </p>
                </div>
                <div className='w-full h-auto my-4'>
                    <Marquee
                        pauseOnHover
                        autoFill>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Work</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Personal</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Fitness</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Education</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Health</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Finance</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Travel</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Hobbies</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Relationships</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Spiritual</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Career</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Self-Development</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Home</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Community</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Creativity</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Environment</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Volunteering</div>
                        <div className='px-3 py-1 bg-[#313131] ml-2 rounded-md border-[#535353] border-[1px] '>Family</div>

                    </Marquee>
                </div>

                <div className='flex items-start mt-7 gap-2 justify-between flex-col md:flex-row'>
                    <div className='flex gap-3 items-center'>
                        <div
                            onClick={() => { setIsOpenCreate(prevCLick => !prevCLick) }}
                            className='flex gap-1 items-center bg-[#476d4a] border-[#535353] border-[1px] cursor-pointer rounded-lg p-3 md:p-2 px-3 hover:bg-[#535353]'>
                            <span className='hidden md:block'>Create a Template</span> <MdPublish />
                        </div>
                        <select
                            // value={category}
                            // onChange={(e) => { setCategory(e.target.value) }}
                            className='p-3 rounded-lg bg-[#111111] outline-none  border-[#535353] border-[1px]  text-[#888]'
                            name="" id="">
                            <option value="">Find template by:</option>
                            <option value="Work">Work</option>
                            <option value="Personal">Personal</option>
                            <option value="Fitness">Fitness</option>
                            <option value="Education">Education</option>
                            <option value="Health">Health</option>
                            <option value="Finance">Finance</option>
                            <option value="Travel">Travel</option>
                            <option value="Hobbies">Hobbies</option>
                            <option value="Relationships">Relationships</option>
                            <option value="Spiritual">Spiritual</option>
                            <option value="Career">Career</option>
                            <option value="Self-Development">Self-Development</option>
                            <option value="Home">Home</option>
                            <option value="Community">Community</option>
                            <option value="Creativity">Creativity</option>
                            <option value="Environment">Environment</option>
                            <option value="Volunteering">Volunteering</option>
                            <option value="Family">Family</option>
                        </select>
                    </div>

                    <input
                        className='p-3 rounded-lg bg-[#111111] outline-none border-[#535353] border-[1px] w-full max-w-[300px]  text-[#888]'
                        type="text" placeholder='Search (e.g., Sofware Engineering)' />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-[3rem] pb-5 ">

                    {
                        fetchedData === null ?
                            <div className='w-[20px] h-[20px]'>
                                <Loader />
                            </div>
                            :
                            <>
                                {
                                    fetchedData && fetchedData?.map((itm: dataType, idx: number) => (
                                        <div
                                            onClick={() => {
                                                nav(`/user/goals/templates/${user?.uid}/${itm?.created_at}`)
                                            }}
                                            key={idx}
                                            className='w-full  bg-[#313131] border-[#535353] relative border-[1px] cursor-pointer rounded-lg overflow-hidden hover:bg-[#222222]'>
                                            <div className='flex h-auto items-start  justify-start   border-b-[#535353] border-b-[1px]  '>
                                                <div
                                                    className={`w-[2px] h-full`}>
                                                </div>

                                                <div className='flex flex-col p-3 w-full'>
                                                    {
                                                        viewEllip === idx && isDelete === null &&
                                                            (<div
                                                                onClick={(e) => { e.stopPropagation() }}
                                                                className=' bg-[#111111] border-[#535353] border-[1px] flex flex-col toRight overflow-hidden rounded-md'>
                                                                <div className='px-2 py-1 border-b-[#535353] border-b-[1px] hover:bg-[#222222]'>View</div>
                                                                <div className='px-2 py-1 border-b-[#535353] border-b-[1px] hover:bg-[#222222]'>Report</div>
                                                                {itm?.authorUid != user?.uid &&
                                                                    <div
                                                                        onClick={() => {
                                                                            setTemplateID(itm?.created_at)
                                                                        }}
                                                                        className='px-2 py-1 border-b-[#535353] border-b-[1px] hover:bg-[#222222]'>Download</div>}
                                                                {itm?.authorUid === user?.uid &&
                                                                    <div
                                                                        onClick={() => { setIsDelete(idx) }}
                                                                        className='px-2 py-1 border-b-[#535353] border-b-[1px] hover:bg-[#222222]'>Delete</div>}
                                                                <div
                                                                    onClick={() => { setViewEllip(null) }}
                                                                    className='px-2 py-1 border-b-[#535353] border-b-[1px] text-red-500 hover:bg-[#222222]'>Close</div>
                                                            </div>)                       
                                                    }
                                                    {
                                                        isDelete === idx && itm?.authorUid === user?.uid && viewEllip === idx &&
                                                        (<div
                                                            onClick={(e) => { e.stopPropagation() }}
                                                            className=' bg-[#111111] border-[#535353] border-[1px] flex flex-col toRight overflow-hidden rounded-md'>
                                                            <div
                                                                onClick={() => { setIsDelete(null) }}
                                                                className='px-2 py-1 border-b-[#535353] border-b-[1px] hover:bg-[#222222]'>Cancel</div>
                                                            <div
                                                                onClick={() => { deleteGoalsByID(itm?.created_at, itm?.authorUid) }}
                                                                className='px-2 py-1 text-red-500 border-b-[#535353] border-b-[1px] hover:bg-[#222222]'>Delete</div>
                                                        </div>)
                                                    }

                                                    <div className='flex gap-3 justify-between w-full'>
                                                        <div className='font-bold mb-1'>
                                                            {itm?.title.length >= 25 ? itm?.title.slice(0, 25) + '...' : itm?.title}
                                                        </div>
                                                        <div>

                                                            <div
                                                                onClick={(e) => { e.stopPropagation(); setViewEllip(idx) }}
                                                                className='text-[#888] hover:text-[#fff]'>
                                                                <FaEllipsisH />
                                                            </div>

                                                        </div>
                                                    </div>

                                                    <div className='text-[#888] text-sm flex gap-1 items-center'>
                                                        <BiCategory />{itm?.category}
                                                    </div>
                                                    <div className='text-[#888] text-sm flex gap-1 items-center'>
                                                        <GetAuthor authorUid={itm?.authorUid} />
                                                    </div>
                                                    <div className='text-[#888] text-sm flex gap-1 items-center'>
                                                        <MdOutlineFileDownload /> {itm?.download_count}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='flex justify-between items-center p-3 text-[#888] gap-2'>
                                                <div>
                                                    {itm?.sub_tasks.filter((itmz) => itmz.is_done).length}
                                                    /
                                                    {itm?.sub_tasks.length}
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
                            </>
                    }
                </div>
            </div>



        </div>
    )
}

export default GoalTemplates

import { useEffect } from 'react';
import { requestForToken, onMessageListener } from '../firebase';
import { useUpdateFCMTokenMutation } from '../features/user/userApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const usePushNotifications = () => {
  const { user } = useSelector((state) => state.auth);
  const [updateToken] = useUpdateFCMTokenMutation();

  useEffect(() => {
    if (user) {
      const initializePush = async () => {
        try {
          const token = await requestForToken();
          if (token) {
            await updateToken({ fcmToken: token }).unwrap();
          }
        } catch (error) {
          console.log('Error initializing push notifications:', error);
        }
      };

      initializePush();
    }
  }, [user, updateToken]);

  useEffect(() => {
    onMessageListener()
      .then((payload) => {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-slate-800`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <img className="h-10 w-10 rounded-full" src={payload.notification.image || "/logo.png"} alt="" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    {payload.notification.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {payload.notification.body}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-slate-800">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  if (payload.data?.click_action) {
                    window.location.href = payload.data.click_action;
                  }
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-400 hover:text-indigo-300 focus:outline-none"
              >
                View
              </button>
            </div>
          </div>
        ));
      })
      .catch((err) => console.log('failed: ', err));
  }, []);
};

export default usePushNotifications;

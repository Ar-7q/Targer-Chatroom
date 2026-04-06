import React, { useState, useEffect } from 'react';
import Card from '../../../components/shared/Card/Card';
import Button from '../../../components/shared/Button/Button';
import styles from './StepAvatar.module.css';

import { useSelector, useDispatch } from 'react-redux';
import { setAvatar } from '../../../store/activateSlice';
import { activate } from '../../../http';
import { setAuth } from '../../../store/authSlice';

import Loader from '../../../components/shared/Loader/Loader';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const StepAvatar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { name, avatar } = useSelector((state) => state.activate);
  const { isAuth, user } = useSelector((state) => state.auth);

  const [image, setImage] = useState('/images/monkey-avatar.png');
  const [loading, setLoading] = useState(false);

  function captureImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = function () {
      setImage(reader.result);
      dispatch(setAvatar(reader.result));
    };
  }

  // ✅ Navigation after auth update
  useEffect(() => {
    if (isAuth && user?.activated) {
      navigate('/rooms');
    }
  }, [isAuth, user, navigate]);

  async function submit() {
    if (!avatar) {
      toast.error('Please upload an avatar..')
      return;
    }

    setLoading(true);

    try {
      const { data } = await activate({ name, avatar });

      if (data?.user) { // ✅ safer check
        // dispatch(setAuth(data));
        dispatch(setAuth({ user: data.user }));
      }

      toast.success('Your Profile Created successfully ..🎉')
    } catch (err) {
      toast.error('Avatar upload Failed ❌')
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loader message="Activation in progress..." />;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card title={`Okay, ${name}`} icon="monkey-emoji">
        <p className={styles.subHeading}>How’s this photo?</p>

        <div className="flex justify-center items-center">
          <img
            className="w-32 h-32 rounded-full object-cover"
            src={image}
            alt="avatar"
          />
        </div>

        <div>
          <input
            onChange={captureImage}
            id="avatarInput"
            type="file"
            className={styles.avatarInput}
          />
          <label className={styles.avatarLabel} htmlFor="avatarInput">
            Choose a different photo
          </label>
        </div>

        <div>
          <Button onClick={submit} text="Next" />
        </div>
      </Card>
    </div>
  );
};

export default StepAvatar;
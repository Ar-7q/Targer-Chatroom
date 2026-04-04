import React, { useState } from 'react';
import Card from '../../../components/shared/Card/Card';
import Button from '../../../components/shared/Button/Button';
import styles from './StepAvatar.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { setAvatar } from '../../../store/activateSlice';
import { activate } from '../../../http';
import { setAuth } from '../../../store/authSlice';

const StepAvatar = ({ onNext }) => {
  const dispatch = useDispatch();
  const { name, avatar } = useSelector((state) => state.activate);
  const [image, setImage] = useState('/images/monkey-avatar.png');

  function captureImage(e) {
    const file = e.target.files[0];
    if (!file) return; // ✅ prevent crash

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = function () {
      setImage(reader.result);
      dispatch(setAvatar(reader.result));
    };
  }

  async function submit() {
    if (!avatar) return; // ✅ prevent empty submit

    try {
      const { data } = await activate({ name, avatar });

      if (data.auth) {
        dispatch(setAuth(data));
        onNext(); // ✅ move to next step
      }

      console.log(data);
    } catch (err) {
      console.log(err);
    }
  }

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
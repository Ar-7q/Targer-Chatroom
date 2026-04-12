import React, { useState } from 'react';
import Card from '../../../components/shared/Card/Card';
import Button from '../../../components/shared/Button/Button';
import TextInput from '../../../components/shared/TextInput/TextInput';
import { useDispatch, useSelector } from 'react-redux';
import { setName } from '../../../store/activateSlice';
import styles from './StepName.module.css';
import { toast } from 'sonner';

const StepName = ({ onNext }) => {
  const { name } = useSelector((state) => state.activate);
  const dispatch = useDispatch();

  const [fullname, setFullname] = useState(name || ''); // ✅ fallback

  function nextStep() {
    if (!fullname.trim()) {
      toast.error('Name is Required ❌');
      return;
    }

    // toast.success('Name saved ✅');

    dispatch(setName(fullname.trim()));

    setTimeout(() => {
      onNext();
    }, 500); // ⏳ small delay
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card title="What’s your full name?" icon="goggle-emoji">
        <TextInput
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
        />

        <p className={styles.paragraph}>
          People use real names at codershouse :) !
        </p>

        <div>
          <Button onClick={nextStep} text="Next" />
        </div>
      </Card>
    </div>
  );
};

export default StepName;
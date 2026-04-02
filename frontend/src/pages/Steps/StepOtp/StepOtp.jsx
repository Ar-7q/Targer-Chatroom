import React from 'react'
import Button from '../../../components/shared/Button/Button';

const StepOtp = ({ onNext }) => {
  return (
    <>
      <div>Otp component</div>
      <Button onClick={onNext} text='Next --'></Button>
    </>
  );
};

export default StepOtp
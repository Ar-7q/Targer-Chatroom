import React from 'react'
import Button from '../../../components/shared/Button/Button';
const StepUsername = ({ onNext }) => {
  return (
    <>
      <div>username component</div>
      <Button onClick={onNext} text='Next --'></Button>
    </>
  );
};

export default StepUsername
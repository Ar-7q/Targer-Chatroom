import React from 'react'
import Button from '../../../components/shared/Button/Button';

const StepAvatar = ({onNext}) => {
  return (
    <>
      <div>Avatar component</div>
      <Button onClick={onNext} text='Next --'></Button>
    </>
  );
}

export default StepAvatar
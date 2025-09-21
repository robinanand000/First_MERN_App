import React, { useEffect, useReducer } from "react";
import "./Input.css";
import { validate } from "../../Util/validators";

const ACTIONS = {
  change: "CHANGE",
  touch: "TOUCH",
};

const inputReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.change:
      return {
        ...state,
        value: action.val,
        isValid: validate(action.val, action.validators),
      };
    case ACTIONS.touch:
      return {
        ...state,
        isTouched: true,
      };
    default:
      return state;
  }
};

const Input = (props) => {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue || "",
    isValid: props.initialValid || false,
    isTouched: false,
  });

  const { id, onInput } = props;
  const { value, isValid } = inputState;
  useEffect(() => {
    onInput(id, value, isValid);
  }, [value, isValid, onInput, id]);

  const changeHandler = (event) => {
    dispatch({
      type: ACTIONS.change,
      val: event.target.value,
      validators: props.validators,
    });
  };
  const touchHandler = () => {
    dispatch({ type: ACTIONS.touch });
  };

  const element =
    props.element === "input" ? (
      <input
        id={props.id}
        placeholder={props.placeholder}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
      />
    ) : (
      <textarea
        id={props.id}
        rows={props.rows || 3}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
      />
    );
  return (
    <div
      className={`form-control 
        ${
          !inputState.isValid && inputState.isTouched && "form-control--invalid"
        }`}
    >
      <label htmlFor={props.id}>{props.label}</label>
      {element}
      {!inputState.isValid && inputState.isTouched && <p>{props.errorText}</p>}
    </div>
  );
};

export default Input;

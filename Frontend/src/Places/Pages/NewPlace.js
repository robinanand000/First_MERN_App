import React from "react";
import { useContext } from "react";
import Input from "../../Shared/Components/FormElements/Input";
import "./PlaceForm.css";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../Shared/Util/validators";
import Button from "../../Shared/Components/FormElements/Button";
import { useForm } from "../../Shared/hooks/form-hook";
import { useHttpClient } from "../../Shared/hooks/http-hook";
import ErrorModal from "../../Shared/Components/UIElements/ErrorModal";
import LoadingSpinner from "../../Shared/Components/UIElements/LoadingSpinner";
import { AuthContext } from "../../Shared/Context/auth-context";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ImageUpload from "../../Shared/Components/FormElements/ImageUpload";

const NewPlace = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const history = useHistory();

  const [formState, inputHandler] = useForm(
    {
      description: {
        val: "",
        isValid: false,
      },
      title: {
        val: "",
        isValid: false,
      },
      address: {
        val: "",
        isValid: false,
      },
      image: {
        val: null,
        isValid: false,
      },
    },
    false
  );

  const placeSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", formState.inputs.title.val);
      formData.append("description", formState.inputs.description.val);
      formData.append("address", formState.inputs.address.val);
      formData.append("image", formState.inputs.image.val);

      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + "/places",
        "POST",
        formData,
        {
          Authorization: "Bearer " + auth.token,
        }
      );

      history.push("/");
    } catch (error) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <form action="" className="place-form" onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid title"
          onInput={inputHandler}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (at least 5 characters)"
          onInput={inputHandler}
        />
        <Input
          id="address"
          element="textarea"
          label="Address"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid address"
          onInput={inputHandler}
        />
        <ImageUpload onInput={inputHandler} center id="image" />
        <Button type="submit" disabled={!formState.isValid}>
          Add Place
        </Button>
      </form>
    </React.Fragment>
  );
};

export default NewPlace;

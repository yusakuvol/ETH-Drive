import { ChangeEvent, InputHTMLAttributes, Ref, forwardRef } from "react";

type Props = {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  id: InputHTMLAttributes<HTMLInputElement>["id"];
};

function InputImage({ onChange, id }: Props, ref: Ref<HTMLInputElement>) {
  return (
    <input
      id={id}
      type="file"
      accept="image/*"
      onChange={onChange}
      hidden
      ref={ref}
    />
  );
}

export default forwardRef<HTMLInputElement, Props>(InputImage);

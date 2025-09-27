import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";

const carModels = ["Vinfast VF9", "Vinfast VF8", "Hyundai Ioniq 5", "Kia EV6"];

export type FormValues = {
  name: string;
  email: string;
  phone: string;
  carModel: string;
};

interface BookingFormProps {
  onSubmit: (data: FormValues) => void;
  onReset: () => void;
}

export interface BookingFormRef {
  submitForm: () => void;
  resetForm: () => void;
}

const BookingForm = forwardRef<BookingFormRef, BookingFormProps>(
  ({ onSubmit, onReset }, ref) => {
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<FormValues>({
      defaultValues: {
        name: "",
        email: "",
        phone: "",
        carModel: carModels[0],
      },
    });

    const handleFormSubmit = (data: FormValues) => {
      onSubmit(data);
      reset();
    };

    const handleReset = () => {
      reset();
      onReset();
    };

    useImperativeHandle(ref, () => ({
      submitForm: () => {
        handleSubmit(handleFormSubmit)();
      },
      resetForm: handleReset,
    }));

    return (
      <div className="w-full flex flex-col items-center py-4 px-4">
        <img
          src="/logo/01.png"
          alt="Logo"
          className="mb-4 object-contain max-h-12"
        />
        <form
          className="w-full space-y-3"
          onSubmit={handleSubmit(handleFormSubmit)}
        >
          <div>
            <label className="block text-xs font-semibold mb-1">
              Contact Name
            </label>
            <input
              type="text"
              className="w-full border-b border-gray-300 outline-none py-1 text-sm"
              placeholder="|"
              {...register("name", { required: "Contact name is required" })}
            />
            {errors.name && (
              <span className="text-xs text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Email</label>
            <input
              type="email"
              className="w-full border-b border-gray-300 outline-none py-1 text-sm"
              placeholder="abc@gmail.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <span className="text-xs text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full border-b border-gray-300 outline-none py-1 text-sm"
              placeholder="+0123456789"
              {...register("phone", { required: "Phone number is required" })}
            />
            {errors.phone && (
              <span className="text-xs text-red-500">
                {errors.phone.message}
              </span>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Car Model
            </label>
            <select
              className="w-full border-b border-gray-300 outline-none py-1 text-sm bg-white"
              {...register("carModel", { required: true })}
            >
              {carModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
          {/* Hidden submit button */}
          <button type="submit" style={{ display: "none" }} />
        </form>
      </div>
    );
  }
);

BookingForm.displayName = "BookingForm";

export default BookingForm;

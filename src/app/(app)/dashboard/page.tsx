import React from "react";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
const page = () => {
  const { data: session } = useSession();
  const form = useForm<z.infer<typeof acceptMessageSchema>>({
    resolver: zodResolver(acceptMessageSchema),
  });
  const { register, watch, setValue } = form;
  return <div></div>;
};
export default page;

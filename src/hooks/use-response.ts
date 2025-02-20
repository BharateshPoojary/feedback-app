const useResponse = () => {
  const responseContent = (
    success: boolean,
    message: string,
    status: number
  ): Response => {
    return Response.json(
      {
        success,
        message,
      },
      { status }
    );
  };
  return { responseContent }; // you're returning an object named responseContent with responseContent function inside it.
};
export const { responseContent } = useResponse(); //when I call this function it will return me an object and I am destructuring reponseContent from it

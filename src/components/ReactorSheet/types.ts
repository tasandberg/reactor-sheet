export type ReactorSheetAppProps = {
  actor?: OSEActor;
  source?: OSEActor;
};

export type OSEActor = Actor & {
  img: string;
  system: {
    details: {
      biography: string;
      notes: string;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scores: any;
  };
};

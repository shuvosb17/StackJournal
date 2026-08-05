type CaseStudyBodyProps = {
  html: string;
};

export function CaseStudyBody({ html }: CaseStudyBodyProps) {
  return (
    <div
      className="case-study-body reader-body mx-auto max-w-[42rem]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

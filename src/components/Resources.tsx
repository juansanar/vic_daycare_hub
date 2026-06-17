export default function Resources() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="mb-6 text-xl font-semibold">Resources & Checklists</h2>

      {/* Island Health Inspections */}
      <section className="mb-8">
        <h3 className="mb-2 text-lg font-medium">
          Island Health Inspection Reports
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            Island Health publishes routine inspection reports for all licensed
            childcare facilities. These reports show whether a facility was in
            compliance with BC's Child Care Licensing Regulation (CCLR) during
            inspections. If a contravention is found, a follow-up inspection is
            conducted.
          </p>
          <p>
            You can search any facility by name to view their inspection history,
            including any contraventions cited and whether they were corrected.
          </p>
          <a
            href="https://inspections.myhealthdepartment.com/island-health/program-ccfl"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-emerald-50 px-4 py-2 font-medium text-emerald-700 hover:bg-emerald-100 transition"
          >
            Search Island Health Inspections &rarr;
          </a>
          <p className="text-xs text-gray-500">
            Child care facility inspections have been posted since March 1, 2010.
            A blank follow-up report means the contravention was corrected.
          </p>
        </div>
      </section>

      {/* Schedule E - Staff Ratios Table */}
      <section className="mb-8">
        <h3 className="mb-2 text-lg font-medium">
          Staff-to-Child Ratios (CCLR Schedule E)
        </h3>
        <p className="mb-3 text-sm text-gray-600">
          BC law requires licensed facilities to maintain minimum staff-to-child
          ratios. This table is from{" "}
          <a
            href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/332_2007#ScheduleE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline"
          >
            Schedule E of the Child Care Licensing Regulation (B.C. Reg. 332/2007)
          </a>
          , current as of June 2026.
        </p>
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium">Care Program</th>
                <th className="px-3 py-2 font-medium">Max Group Size</th>
                <th className="px-3 py-2 font-medium">Children per Group</th>
                <th className="px-3 py-2 font-medium">Staff Required</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-3 py-2 font-medium" rowSpan={3}>
                  Group Child Care (Under 36 Months)
                </td>
                <td className="px-3 py-2" rowSpan={3}>
                  12 (separate area per group)
                </td>
                <td className="px-3 py-2">&le; 4</td>
                <td className="px-3 py-2">1 infant/toddler educator</td>
              </tr>
              <tr>
                <td className="px-3 py-2">5 – 8</td>
                <td className="px-3 py-2">
                  1 infant/toddler educator + 1 educator
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">9 – 12</td>
                <td className="px-3 py-2">
                  1 infant/toddler educator + 1 educator + 1 assistant
                </td>
              </tr>

              <tr className="bg-gray-50">
                <td className="px-3 py-2 font-medium" rowSpan={3}>
                  Group Child Care (30 Months to School Age)
                </td>
                <td className="px-3 py-2" rowSpan={3}>
                  25 (max 2 children &lt; 36 months)
                </td>
                <td className="px-3 py-2">&le; 8</td>
                <td className="px-3 py-2">1 educator</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-3 py-2">9 – 16</td>
                <td className="px-3 py-2">1 educator + 1 assistant</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-3 py-2">17 – 25</td>
                <td className="px-3 py-2">1 educator + 2 assistants</td>
              </tr>

              <tr>
                <td className="px-3 py-2 font-medium" rowSpan={2}>
                  Preschool (30 Months to School Age)
                </td>
                <td className="px-3 py-2" rowSpan={2}>20</td>
                <td className="px-3 py-2">&le; 10</td>
                <td className="px-3 py-2">1 educator</td>
              </tr>
              <tr>
                <td className="px-3 py-2">11 – 20</td>
                <td className="px-3 py-2">1 educator + 1 assistant</td>
              </tr>

              <tr className="bg-gray-50">
                <td className="px-3 py-2 font-medium" rowSpan={2}>
                  School Age (preschool/grade 1 present)
                </td>
                <td className="px-3 py-2" rowSpan={2}>24</td>
                <td className="px-3 py-2">&le; 12</td>
                <td className="px-3 py-2">1 responsible adult</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-3 py-2">13 – 24</td>
                <td className="px-3 py-2">2 responsible adults</td>
              </tr>

              <tr>
                <td className="px-3 py-2 font-medium" rowSpan={2}>
                  School Age (no preschool/grade 1)
                </td>
                <td className="px-3 py-2" rowSpan={2}>30</td>
                <td className="px-3 py-2">&le; 15</td>
                <td className="px-3 py-2">1 responsible adult</td>
              </tr>
              <tr>
                <td className="px-3 py-2">16 – 30</td>
                <td className="px-3 py-2">2 responsible adults</td>
              </tr>

              <tr className="bg-gray-50">
                <td className="px-3 py-2 font-medium">
                  Family Child Care (child &lt; 12 months present)
                </td>
                <td className="px-3 py-2">
                  7 (max 3 &lt; 48 months, max 1 &lt; 12 months)
                </td>
                <td className="px-3 py-2">&le; 7</td>
                <td className="px-3 py-2">The licensee</td>
              </tr>

              <tr>
                <td className="px-3 py-2 font-medium">
                  Family Child Care (no child &lt; 12 months)
                </td>
                <td className="px-3 py-2">
                  7 (max 4 &lt; 48 months, max 2 &lt; 24 months)
                </td>
                <td className="px-3 py-2">&le; 7</td>
                <td className="px-3 py-2">The licensee</td>
              </tr>

              <tr className="bg-gray-50">
                <td className="px-3 py-2 font-medium">
                  Multi-Age (child &lt; 12 months present)
                </td>
                <td className="px-3 py-2">
                  8 (max 3 &lt; 36 months, max 1 &lt; 12 months)
                </td>
                <td className="px-3 py-2">&le; 8</td>
                <td className="px-3 py-2">1 educator</td>
              </tr>

              <tr>
                <td className="px-3 py-2 font-medium">
                  Multi-Age (no child &lt; 12 months)
                </td>
                <td className="px-3 py-2">8 (max 3 &lt; 36 months)</td>
                <td className="px-3 py-2">&le; 8</td>
                <td className="px-3 py-2">1 educator</td>
              </tr>

              <tr className="bg-gray-50">
                <td className="px-3 py-2 font-medium">
                  In-Home Multi-Age
                </td>
                <td className="px-3 py-2">
                  8 (same age restrictions as Multi-Age)
                </td>
                <td className="px-3 py-2">&le; 8</td>
                <td className="px-3 py-2">
                  The licensee (must be a certified educator)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Source:{" "}
          <a
            href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/332_2007#ScheduleE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline"
          >
            B.C. Reg. 332/2007, Schedule E
          </a>
          . Consolidated to June 2026. Check BCLaws for the most current version.
        </p>
      </section>

      {/* CCFRI explainer */}
      <section className="mb-8">
        <h3 className="mb-2 text-lg font-medium">
          Understanding BC Child Care Funding
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>$10 a Day ChildCareBC Centres:</strong> A select group of
            facilities that charge families no more than $10/day for full-time
            care. The province funds the difference. Access is based on each
            centre's capacity and waitlist — families do not apply to the
            program, they apply directly to the centre.
          </p>
          <p>
            <strong>CCFRI (Child Care Fee Reduction Initiative):</strong> Most
            licensed facilities (not just $10/day) receive government funding
            to reduce parent fees. The amount varies by care type. Participating
            centres show reduced fees automatically — you do not need to apply
            separately.
          </p>
          <p>
            <strong>Affordable Child Care Benefit (ACCB):</strong> A separate,
            income-tested benefit families apply for directly through the BC
            government. It can reduce your fees further at any licensed
            facility. Apply online or through your local CCRR.
          </p>
          <p className="text-xs text-gray-500">
            Note: BC paused the expansion of the $10/day program in Budget
            2026. Existing centres remain active. Always confirm directly with
            the facility.
          </p>
        </div>
        <a
          href="https://www2.gov.bc.ca/gov/content/family-social-supports/caring-for-young-children/childcarebc-programs"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-emerald-600 hover:underline"
        >
          Official BC ChildCareBC page &rarr;
        </a>
      </section>

      {/* Questions to ask */}
      <section className="mb-8">
        <h3 className="mb-2 text-lg font-medium">
          Questions to Ask When You Call
        </h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
          <li>Do you have availability for [age group]? When?</li>
          <li>What are the current fees? Are you part of CCFRI?</li>
          <li>Do you have a waitlist? How long is it typically?</li>
          <li>What hours/days are available?</li>
          <li>What is your staff-to-child ratio?</li>
          <li>Are meals/snacks provided? Any allergy accommodations?</li>
          <li>What is your sick-child policy?</li>
          <li>Can I schedule a visit/tour?</li>
          <li>What documents do I need to register?</li>
          <li>Do you accept the Affordable Child Care Benefit?</li>
          <li>Can I view your most recent Island Health inspection report?</li>
        </ul>
      </section>

      {/* Document checklist */}
      <section className="mb-8">
        <h3 className="mb-2 text-lg font-medium">Document Checklist</h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
          <li>Child's birth certificate or passport</li>
          <li>BC CareCard / MSP number</li>
          <li>Immunization records</li>
          <li>Emergency contact information</li>
          <li>Consent forms (pickup, medication, photos)</li>
          <li>ACCB confirmation letter (if applicable)</li>
          <li>Any custody/access documents (if applicable)</li>
        </ul>
      </section>

      {/* Links */}
      <section>
        <h3 className="mb-2 text-lg font-medium">Helpful Links</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="https://inspections.myhealthdepartment.com/island-health/program-ccfl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              Island Health Childcare Inspection Reports
            </a>
          </li>
          <li>
            <a
              href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/332_2007"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              Child Care Licensing Regulation (full text)
            </a>
          </li>
          <li>
            <a
              href="https://www.childcarevictoria.org/families/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              Victoria Child Care Resource & Referral Centre
            </a>
          </li>
          <li>
            <a
              href="https://www2.gov.bc.ca/gov/content/family-social-supports/caring-for-young-children/childcarebc-programs/10-a-day-childcarebc-centres"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              $10 a Day ChildCareBC Centres list
            </a>
          </li>
          <li>
            <a
              href="https://www2.gov.bc.ca/gov/content/family-social-supports/caring-for-young-children/child-care-funding/affordable-child-care-benefit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              Affordable Child Care Benefit (ACCB)
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}

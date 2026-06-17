export default function Resources() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="mb-6 text-xl font-semibold">Resources & Checklists</h2>

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
            centre's capacity and waitlist—families do not apply to the
            program, they apply directly to the centre.
          </p>
          <p>
            <strong>CCFRI (Child Care Fee Reduction Initiative):</strong> Most
            licensed facilities (not just $10/day) receive government funding
            to reduce parent fees. The amount varies by care type. Participating
            centres show reduced fees automatically—you do not need to apply
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
          className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
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
              href="https://www.childcarevictoria.org/families/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              Victoria Child Care Resource & Referral Centre
            </a>
          </li>
          <li>
            <a
              href="https://www2.gov.bc.ca/gov/content/family-social-supports/caring-for-young-children/childcarebc-programs/10-a-day-childcarebc-centres"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              $10 a Day ChildCareBC Centres list
            </a>
          </li>
          <li>
            <a
              href="https://www2.gov.bc.ca/gov/content/family-social-supports/caring-for-young-children/child-care-funding/affordable-child-care-benefit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              Affordable Child Care Benefit (ACCB)
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}

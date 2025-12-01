import * as identitykeys from '../vdxf/identitydatakeys';
import * as keylist from '../vdxf/keys';
export declare const getFriendlyNameForVdxfKey: (vdxfkey: string, locale?: string) => any;
export declare const IdentityVdxfidMap: {
    [identitykeys.IDENTITY_FIRSTNAME.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_LASTNAME.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_MIDDLENAME.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_GENDER.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_NATIONALITY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_ATTESTOR.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_ATTESTATION_RECIPIENT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PHONENUMBER.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DATEOFBIRTH.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_OVER18.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_OVER21.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_OVER25.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_EMAIL.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_HOMEADDRESS.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_HOMEADDRESS_STREET1.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_HOMEADDRESS_STREET2.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_HOMEADDRESS_CITY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_HOMEADDRESS_REGION.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_HOMEADDRESS_POSTCODE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_HOMEADDRESS_COUNTRY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDNUMBER_VALUE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDNUMBER_TYPE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VERIFICATION_STATUS.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_ACCEPTEDTOS.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_VERIFIEDSMS.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_KYCCHECKED.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_DOCUMENTSVERIFIED.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_SELFIECHECKED.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_WATCHLISTOK.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_RISKCHECKOK.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_ORIGINALFRONT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_ORIGINALBACK.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_CROPPEDFRONT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_CROPPEDBACK.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_FACE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_IDNUMBER.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_CATEGORY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_EXPIRATIONDATE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_ISSUINGCOUNTRY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_ISSUINGREGION.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_DATEOFBIRTH.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_ADDRESS_STREET1.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_ADDRESS_CITY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_ADDRESS_REGION.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_ADDRESS_POSTCODE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_DRIVINGLICENCE_ADDRESS_COUNTRY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_SELFIECHECK_IMAGE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_SELFIECHECK_VIDEO.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_RISKCHECKOK.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_EMAIL_ISDELIVERABLE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_EMAIL_BREACHCOUNT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_EMAIL_FIRSTBREACHEDAT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_EMAIL_LASTBREACHEDAT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_EMAIL_DOMAIN_REGISTEREDAT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_EMAIL_DOMAIN_FREEPROVIDER.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_EMAIL_DOMAIN_CUSTOM.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_EMAIL_DOMAIN_DISPOSABLE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_EMAIL_DOMAIN_TOPLEVEL_SUSPICIOUS.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD_ORIGINALFRONT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD_ORIGINALBACK.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD_CROPPEDFRONT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD_CROPPEDBACK.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD_FACE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD_IDNUMBER.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD_CATEGORY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD_EXPIRATIONDATE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD_ISSUINGREGION.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD_DATEOFBIRTH.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD_ADDRESS_STREET1.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD_ADDRESS_CITY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD_ADDRESS_REGION.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD_ADDRESS_POSTCODE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_IDCARD_ADDRESS_COUNTRY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PASSPORT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PASSPORT_ORIGINALFRONT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PASSPORT_ORIGINALBACK.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PASSPORT_CROPPEDFRONT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PASSPORT_CROPPEDBACK.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PASSPORT_FACE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PASSPORT_IDNUMBER.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PASSPORT_CATEGORY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PASSPORT_EXPIRATIONDATE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PASSPORT_DATEOFBIRTH.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PASSPORT_ADDRESS_STREET1.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PASSPORT_ADDRESS_CITY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PASSPORT_ADDRESS_REGION.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PASSPORT_ADDRESS_POSTCODE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_PASSPORT_ADDRESS_COUNTRY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ORIGINALFRONT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ORIGINALBACK.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_CROPPEDFRONT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_CROPPEDBACK.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_FACE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_IDNUMBER.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_CATEGORY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_EXPIRATIONDATE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ISSUINGREGION.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_DATEOFBIRTH.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ADDRESS.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ADDRESS_STREET1.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ADDRESS_CITY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ADDRESS_REGION.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ADDRESS_POSTCODE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ADDRESS_COUNTRY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD_ORIGINALFRONT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD_ORIGINALBACK.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD_CROPPEDFRONT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD_CROPPEDBACK.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD_FACE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD_IDNUMBER.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD_CATEGORY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD_EXPIRATIONDATE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD_ISSUINGREGION.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD_DATEOFBIRTH.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD_ADDRESS_STREET1.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD_ADDRESS_CITY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD_ADDRESS_REGION.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD_ADDRESS_POSTCODE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_RESIDENTCARD_ADDRESS_COUNTRY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA_ORIGINALFRONT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA_ORIGINALBACK.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA_CROPPEDFRONT.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA_CROPPEDBACK.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA_FACE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA_IDNUMBER.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA_CATEGORY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA_EXPIRATIONDATE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA_ISSUINGREGION.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA_DATEOFBIRTH.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA_ADDRESS_STREET1.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA_ADDRESS_CITY.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA_ADDRESS_REGION.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA_ADDRESS_POSTCODE.vdxfid]: {
        EN: string;
    };
    [identitykeys.IDENTITY_VISA_ADDRESS_COUNTRY.vdxfid]: {
        EN: string;
    };
    [keylist.ATTESTATION_PROVISION_TYPE.vdxfid]: {
        EN: string;
    };
    [keylist.ATTESTATION_PROVISION_URL.vdxfid]: {
        EN: string;
    };
    [keylist.ATTESTATION_VIEW_RESPONSE.vdxfid]: {
        EN: string;
    };
    [keylist.ATTESTATION_VIEW_REQUEST.vdxfid]: {
        EN: string;
    };
    [keylist.PROFILE_DATA_VIEW_REQUEST.vdxfid]: {
        EN: string;
    };
    [keylist.IDENTITY_SIGNDATA_REQUEST.vdxfid]: {
        EN: string;
    };
};

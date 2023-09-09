import { createSlice } from '@reduxjs/toolkit';

const sectionsSlice = createSlice({
    name: 'sections',
    initialState: {
        sections: [],
        isSectionDeleted: false,
    },
    reducers: {
        setIsSectionDeleted: (state, action) => {
            state.isSectionDeleted = action.payload;
        },
        setSections: (state, action) => {
            state.sections = action.payload;
        },
        createSections: (state, action) => {
            state.sections = [...state.sections, ...action.payload];
        },
        deleteSections: (state, action) => {
            const subAndCrseCode = action.payload;
            state.sections = state.sections.filter((section) => section.subAndCrseCode !== subAndCrseCode);
        },
        handleCheckboxChange: (state, action) => {
            const uniqueIdentifier = action.payload;
            state.sections = state.sections.map((section) =>
                section.uniqueIdentifier === uniqueIdentifier
                    ? {
                          ...section,
                          isHovering: !section.isHovering,
                      }
                    : section
            );
        },
        handleEnterHover: (state, action) => {
            const { section, uniqueIdentifier } = action.payload;
            state.sections = [
                ...state.sections,
                {
                    ...section,
                    isHovering: true,
                    uniqueIdentifier: uniqueIdentifier,
                },
            ];
        },
        handleExitHover: (state, action) => {
            const uniqueIdentifier = action.payload;
            state.sections = state.sections.filter((section) => section.uniqueIdentifier !== uniqueIdentifier);
        },
        updateSectionsColor: (state, action) => {
            const { subAndCrseCode, color } = action.payload;
            state.sections = state.sections.map((selectedSection) =>
                selectedSection.subAndCrseCode === subAndCrseCode
                    ? { ...selectedSection, courseColor: color }
                    : selectedSection
            );
        },
        createSection: (state, action) => {
            state.sections = [action.payload, ...state.sections];
        },
        deleteSection: (state, action) => {
            const uniqueIdentifier = action.payload;
            state.sections = state.sections.filter((section) => section.uniqueIdentifier !== uniqueIdentifier);
            state.isSectionDeleted = true;
        },
    },
});

export const {
    setIsSectionDeleted,
    setSections,
    createSections,
    deleteSections,
    handleCheckboxChange,
    handleEnterHover,
    handleExitHover,
    updateSectionsColor,
    createSection,
    deleteSection,
} = sectionsSlice.actions;

export default sectionsSlice.reducer;
